async function readDirectory() {
    let story_likes_data = {};
    let messages_data = {};
    let liked_posts_data = {};
    let total_messages = 0;
    let total_reacts_and_stickers = 0;
    let LIMIT = 10;
    let dirHandle;

    try {
        dirHandle = await window.showDirectoryPicker();
        check1 = await dirHandle.getDirectoryHandle('personal_information');
        check2 = await dirHandle.getDirectoryHandle(
            'story_sticker_interactions'
        );
        check3 = await dirHandle.getDirectoryHandle('messages');
    } catch (error) {
        console.error('Are you sure you pick the correct folder :/ ?');
        return;
    }

    try {
        async function getFolder(path) {
            path = path.split('/');
            let result = dirHandle;
            for (let i = 0; i < path.length; i++) {
                result = await conditionalFileHandle(path[i]);
            }
            return result;
            function conditionalFileHandle(name) {
                return result.getDirectoryHandle(name);
            }
        }
        async function getJSON(path) {
            path = path.split('/');
            let result = dirHandle;
            for (let i = 0; i < path.length; i++) {
                result = await conditionalFileHandle(
                    path[i],
                    i < path.length - 1
                );
            }
            return JSON.parse(await readFileContents(await result.getFile()));
            function conditionalFileHandle(name, isDir) {
                return isDir
                    ? result.getDirectoryHandle(name)
                    : result.getFileHandle(name);
            }
        }
        // get name
        const personal_information = await getJSON(
            'personal_information/personal_information.json'
        );
        const your_name = getUTF8String(
            personal_information.profile_user[0].string_map_data.Name.value
        );
        const your_user_name =
            personal_information.profile_user[0].string_map_data.Username.value;

        //get blocked
        const blocked_number = (
            await getJSON('followers_and_following/blocked_accounts.json')
        ).relationships_blocked_users.length;

        //get liked posts
        const liked_posts = (await getJSON('likes/liked_posts.json'))
            .likes_media_likes;
        for (const { title } of liked_posts) {
            setDefault(liked_posts_data, title, 0);
            liked_posts_data[title]++;
        }
        delete liked_posts_data[your_user_name];
        liked_posts_data = Object.entries(liked_posts_data)
            .sort((a, b) => b[1] - a[1]) // Sort in descending order based on the values
            .slice(0, LIMIT);

        // get story_likes
        const story_likes = (
            await getJSON('story_sticker_interactions/story_likes.json')
        ).story_activities_story_likes;
        for (const { title } of story_likes) {
            setDefault(story_likes_data, title, 0);
            story_likes_data[title]++;
        }
        const total_story_likes_ppl = Object.keys(story_likes_data).length;
        const total_story_likes = story_likes.length;

        // get messages
        const messenger_directory = await getFolder('messages/inbox');
        for await (const [key, value] of messenger_directory) {
            if (value.kind == 'file') continue;
            for await (const [key_, value_] of value) {
                if (/^message_.*\.json$/.test(key_)) {
                    const data = JSON.parse(
                        await readFileContents(await value_.getFile())
                    );

                    //console.log(key_, key);
                    const default_name = getUTF8String(
                        data.participants[0].name
                    );

                    const is_group_chat = data.participants.length > 2;

                    //console.log(data);
                    for (const m of data.messages) {
                        sender_name = getUTF8String(m.sender_name);
                        if (sender_name == your_name) {
                            total_messages++;
                        } else if (
                            sender_name != 'Instagram User' &&
                            sender_name != your_name &&
                            !is_group_chat
                        ) {
                            setDefault(messages_data, sender_name, {
                                call: 0,
                                messages: 0,
                                call_duration: 0,
                            });
                            messages_data[sender_name].messages++;
                        }

                        if (
                            m.hasOwnProperty('call_duration') &&
                            default_name != 'Instagram User' &&
                            !is_group_chat
                        ) {
                            setDefault(messages_data, default_name, {
                                call: 0,
                                messages: 0,
                                call_duration: 0,
                            });
                            messages_data[default_name].call_duration +=
                                m.call_duration;
                            messages_data[default_name].call++;
                        }

                        if (m.hasOwnProperty('reactions')) {
                            for (const { actor } of m.reactions) {
                                if (actor == your_name) {
                                    total_reacts_and_stickers++;
                                }
                            }
                        }
                    }
                }
            }
        }

        // sorting messages_data
        messages_data = Object.entries(messages_data)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => {
                const keyA = a.messages;
                const keyB = b.messages;

                // Sort in descending order
                return keyB - keyA;
            })
            .slice(0, LIMIT);

        // sorting story_likes_data
        story_likes_data = Object.entries(story_likes_data)
            .sort((a, b) => b[1] - a[1]) // Sort in descending order based on the values
            .slice(0, LIMIT);

        const output_data = {
            total_messages: total_messages,
            total_reacts_and_stickers: total_reacts_and_stickers,
            top_inbox: messages_data,
            top_story_likes: story_likes_data,
            total_story_likes: total_story_likes,
            total_story_likes_ppl: total_story_likes_ppl,
            liked_posts_data: liked_posts_data,
            blocked_number: blocked_number,
        };

        console.log(output_data);
        dataPopulation(output_data);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function readFileContents(file) {
    try {
        const text = await file.text();
        return text;
    } catch (error) {
        console.error('Error reading file contents:', error);
        throw error;
    }
}

function setDefault(object, prop, default_value) {
    if (!object.hasOwnProperty(prop)) {
        object[prop] = default_value;
    }
}

function getUTF8String(encodedString) {
    // Convert the encoded string to bytes
    //console.log(encodedString);
    const bytes = new Uint8Array(
        encodedString.split('').map((c) => c.charCodeAt(0))
    );

    // Decode the bytes using TextDecoder
    return (decodedString = new TextDecoder('utf-8').decode(bytes));
}

function pauseStartAnimation() {
    const pauseButtonText = document.getElementById('pause-button-text');
    const pauseButtonIcon = document.getElementById('pause-button-icon');
    if (paused) {
        pauseButtonText.innerText = 'Pause';
        pauseButtonIcon.innerText = 'pause';
        paused = false;
    } else {
        pauseButtonText.innerText = 'Play';
        pauseButtonIcon.innerText = 'play_arrow';
        paused = true;
    }
}

function dataPopulation(yourData) {
    const topPeople = document.getElementById('top-people');
    const topPhrases = document.getElementById('top-phrases');
    const totalMessages = document.getElementById('total-messages');
    const totalReactsAndStickers = document.getElementById(
        'total-reacts-and-stickers'
    );

    // populate top people
    for (let i = 0; i < yourData.top_inbox.length; i++) {
        let el = document.createElement('li');
        let details = yourData.top_inbox[i].name;
        if (i <= 2) {
            const { hours, minutes } = secondsToHoursMinutes(
                yourData.top_inbox[i].call_duration
            );
            details = `
                <details>
                <summary>${
                    yourData.top_inbox[i].name
                } <greenspan> (bấm để xem thêm)</greenspan>
                </summary>
                <p>
                    + ${yourData.top_inbox[i].call} lần và
                    ${
                        hours == 0 ? '' : `${hours} tiếng `
                    }${minutes} phút alo <br>
                    + ${yourData.top_inbox[
                        i
                    ].messages.toLocaleString()} tin nhắn
                </p>
                </details>`;
        }
        el.innerHTML = details;
        topPeople.appendChild(el);
    }

    // populate top story likes
    for (let i = 0; i < yourData.top_story_likes.length; i++) {
        let el = document.createElement('li');
        el.innerHTML = `@${yourData.top_story_likes[i][0]} <greenspan>(${yourData.top_story_likes[i][1]} lần)</greenspan>`;
        topPhrases.appendChild(el);
    }

    // populate total messages sent
    totalMessages.innerText = yourData.total_messages.toLocaleString();

    // populate total reacts and stickers sent
    totalReactsAndStickers.innerText =
        yourData.total_story_likes.toLocaleString();

    document.querySelector('#total_storylikes_ppl').innerText =
        yourData.total_story_likes_ppl.toLocaleString();

    document.querySelector('#blocked-number').innerText =
        yourData.blocked_number;
}

function secondsToHoursMinutes(seconds) {
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);

    return { hours, minutes };
}
