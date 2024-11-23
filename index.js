let followers_list = [];
let thank_you_note = [
    'Hẹn họ đi cafe và trả tiền gửi xe để tỏ lòng biết ơn',
    'Gửi cho mỗi người 50 nghìn để tỏ lòng biết ơn',
    'Từ đây đến cuối tháng hãy bão tim story họ để tỏ lòng biết ơn',
];
let blocked_note = [
    'Trao giải cho bông hoa tệ nhất',
    'Cuộc sống sẽ vui hơn nếu không có một số người',
    'Quyết định đúng đắn nhất bạn từng làm',
    'Làm sao mà đến nước này?',
    'Mừng cho bạn và tất cả chúng ta',
    'Chặn những người không lành mạnh để bảo vệ không gian cá nhân của bạn',
    'Bộ an ninh quốc phòng xin thông báo',
];
const atsymbol = getRandomItems('⚘✽✾✿❀❁❃❊❋✤✣⚜⚘ꕤꕥ☘'.split(''), 1);
const at = `<span id="flower">${atsymbol}</span>`;
const msg = `:/ Bạn có chắc bạn chọn đúng folder không? Đảm bảo rằng folder bạn chọn là folder chứa mấy cái folder con bên trong ví dự như 'personal_information', 'messages', 'followers_and_following',... Bạn có thể thử tải lại/giải nén lại file zip <br>-`;
const LIMIT = 10;
let startTimestamp = 0;
let your_user_name = '';

async function readDirectory() {
    async function recursiveFind(dir, filename, endwith = null) {
        try {
            const path = filename ? filename.split('/') : [];
            if (path.length > 1) {
                let dir_ = dir;
                for (let i = 0; i < path.length; i++) {
                    dir_ = (await recursiveFind(dir_, path[i], endwith)).result;
                }
                return { result: dir_, error: 'no error' };
            }
            const entries = await dir.entries();
            const entriesArray = [];
            for await (const [key, value] of entries) {
                entriesArray.push([key, value]);
                if ((endwith && key.endsWith(endwith)) || key == filename) {
                    return { result: value, error: 'no error' };
                }
            }
            for (const [key, value] of entriesArray) {
                if (value.kind == 'file' || excludeFolder(key)) continue;
                dir = await recursiveFind(value, filename, endwith);
                if (dir.result) return dir;
            }
            return {
                result: false,
                error: `không tìm thấy file/folder ${
                    filename ? `với tên ${filename}` : ``
                }${endwith ? `có tên file kết thúc với ${endwith}` : ``}`,
            };
        } catch (error) {
            return {
                result: false,
                error: `không tìm thấy file/folder ${
                    filename ? `với tên ${filename}` : ``
                }${
                    endwith ? `có tên file kết thúc với ${endwith}` : ``
                } --- ${error}`,
            };
        }
    }
    async function recursiveFindJSONCheck(dir, filename, log = false) {
        const file = await recursiveFind(dir, filename);
        if (!file.result && log) {
            logmessage(`${log} chi tiết: ${file.error}`);
        }
        return (
            file.result &&
            JSON.parse(await readFileContents(await file.result.getFile()))
        );
    }
    async function recursiveFindLog(
        dir,
        filename,
        endwith = null,
        log = false
    ) {
        const file = await recursiveFind(dir, filename, endwith);
        if (!file.result && log) {
            logmessage(`${log} chi tiết: ${file.error}`);
        }
        return file.result;
    }
    function logmessage(msg) {
        document.querySelector('#error').innerHTML += msg + '<br><br>';
        document.querySelector('#instruction').classList.remove('hidden');
        document.querySelector('#main').classList.add('hidden');
        document.querySelector('#readDirectory').innerText =
            'Có lỗi rùi - chọn lại';
    }
    let story_likes_data = {};
    let messages_data = {};
    let liked_posts_data = {};
    let liked_threads_data = {};
    let total_messages = 0;
    let total_reacts_and_stickers = 0;
    let dirHandle = await window.showDirectoryPicker();
    let followers_object = {};
    followers_list = [];
    let imageURL = false;

    document.querySelector('#readDirectory').innerText = 'Chờ tí...';

    if (await recursiveFindLog(dirHandle, null, '.html')) {
        logmessage(
            `- :/ Bạn ơi bạn check lại bước 7 - phải chọn format là JSON chứ không phải là HTML nhá<br><br>`
        );
        return;
    }

    // fuck instagram - this is the old directory before 21 Dec 2023
    /*
    const personal_information = await JSONCheck(
        'personal_information/personal_information.json'
    );
    const blocked_check = await JSONCheck(
        'followers_and_following/blocked_accounts.json',
        false
    );
    const restricted_check = await JSONCheck(
        'followers_and_following/restricted_accounts.json',
        false
    );
    const story_likes_check = await JSONCheck(
        'story_sticker_interactions/story_likes.json',
        false
    );
    const follow_directory = await FolderCheck(
        'followers_and_following'
    );
    const messenger_directory = await FolderCheck(
        'messages/inbox'
    );
    const profile_photo_uri = (
        await JSONCheck('content/profile_photos.json', false)
    */

    let personal_information = await recursiveFindJSONCheck(
        dirHandle,
        'personal_information.json',
        msg
    );
    if (!personal_information) return;
    //
    const blocked_check = await recursiveFindJSONCheck(
        dirHandle,
        'blocked_accounts.json'
    );
    const restricted_check = await recursiveFindJSONCheck(
        dirHandle,
        'restricted_accounts.json'
    );
    const story_likes_check = await recursiveFindJSONCheck(
        dirHandle,
        'story_likes.json'
    );
    const liked_posts_check = await recursiveFindJSONCheck(
        dirHandle,
        'liked_posts.json'
    );
    const liked_threads_check = await recursiveFindJSONCheck(
        dirHandle,
        'threads/liked_threads.json'
    );
    const info_download = await recursiveFindJSONCheck(
        dirHandle,
        'your_information_download_requests.json'
    );
    //
    let follow_directory = await recursiveFindLog(
        dirHandle,
        'followers_and_following',
        null,
        msg
    );
    if (!follow_directory) return;
    //
    let messenger_directory = await recursiveFindLog(
        dirHandle,
        'messages/inbox',
        null,
        msg
    );
    if (!messenger_directory) return;
    //
    const profile_photo_uri = (
        await recursiveFindJSONCheck(dirHandle, 'profile_photos.json')
    )?.ig_profile_picture?.[0]?.uri;
    if (profile_photo_uri) {
        try {
            imageURL = URL.createObjectURL(
                await (
                    await recursiveFindLog(dirHandle, profile_photo_uri)
                ).getFile()
            );
        } catch (e) {
            imageURL = false;
            console.log(e);
        }
    }
    //////////////////////////////////////////////////////////////////
    try {
        // get info
        if (info_download) {
            const ts = info_download
                .reduce(
                    (max, item) => (+item.fbid > +max.fbid ? item : max),
                    info_download[0]
                )
                .label_values.find(
                    (vl) => vl.ent_field_name == 'StartTimestamp'
                );
            startTimestamp = (ts?.timestamp_value ?? 0) * 1000;
        }
        // get name
        console.log(personal_information);
        const isVn =
            personal_information.profile_user[0].string_map_data.hasOwnProperty(
                'T\u00c3\u00aan ng\u00c6\u00b0\u00e1\u00bb\u009di d\u00c3\u00b9ng'
            );
        your_user_name =
            personal_information.profile_user[0].string_map_data[
                isVn
                    ? 'T\u00c3\u00aan ng\u00c6\u00b0\u00e1\u00bb\u009di d\u00c3\u00b9ng'
                    : 'Username'
            ].value;
        // get followers
        for await (const [key, value] of follow_directory) {
            if (key.startsWith('followers') && key.endsWith('.json')) {
                const data = JSON.parse(
                    await readFileContents(await value.getFile())
                );
                data.forEach(({ string_list_data }) => {
                    string_list_data.forEach(({ value }) => {
                        followers_object[value] = true;
                    });
                });
            }
        }
        followers_list = Object.keys(followers_object);

        //get blocked
        const blocked_number =
            blocked_check?.relationships_blocked_users?.length ?? 0;
        document.querySelector('#blocked-note').innerText =
            blocked_number == 0
                ? ' Năm nay mọi người xung quanh rất tốt với bạn'
                : getRandomItems(blocked_note, 1);

        //get restricted
        const restricted_number =
            restricted_check?.relationships_restricted_users?.length ?? 0;
        //get liked posts
        const liked_posts = liked_posts_check?.likes_media_likes ?? [];
        for (const { title } of liked_posts) {
            setDefault(liked_posts_data, title, 0);
            liked_posts_data[title]++;
        }
        const total_post_likes_ppl = Object.keys(liked_posts_data).length;
        const total_post_likes = liked_posts.length;
        //get liked threads
        const liked_threads =
            liked_threads_check?.text_post_app_media_likes ?? [];
        for (const { title } of liked_threads) {
            setDefault(liked_threads_data, title, 0);
            liked_threads_data[title]++;
        }
        const total_thread_likes_ppl = Object.keys(liked_threads_data).length;
        const total_thread_likes = liked_threads.length;
        // get story_likes
        const story_likes =
            story_likes_check?.story_activities_story_likes ?? [];
        for (const { title } of story_likes) {
            setDefault(story_likes_data, title, 0);
            story_likes_data[title]++;
        }
        const total_story_likes_ppl = Object.keys(story_likes_data).length;
        const total_story_likes = story_likes.length;

        // get messages
        for await (const [key, value] of messenger_directory) {
            if (value.kind == 'file') continue;
            for await (const [key_, value_] of value) {
                if (key_.startsWith('message') && key_.endsWith('.json')) {
                    const data = JSON.parse(
                        await readFileContents(await value_.getFile())
                    );
                    const default_name = getUTF8String(
                        data.participants[0].name
                    );
                    const your_name = getUTF8String(
                        data.participants[data.participants.length - 1].name
                    );

                    const is_group_chat = data.participants.length > 2;

                    //console.log(data);
                    for (const m of data.messages) {
                        sender_name = getUTF8String(m.sender_name);
                        if (sender_name == your_name) {
                            total_messages++;
                        }

                        if (
                            default_name != 'Instagram User' &&
                            sender_name == your_name &&
                            !is_group_chat
                        ) {
                            setDefault(messages_data, default_name, {
                                call: 0,
                                messages: 0,
                                call_duration: 0,
                                score: 0,
                            });
                            messages_data[default_name].messages++;
                            messages_data[default_name].score += calcTimeScore(
                                m.timestamp_ms
                            );
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
                                score: 0,
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
        const total_messages_ppl = Object.keys(messages_data).length;

        // sorting messages_data
        messages_data = Object.entries(messages_data)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => {
                const keyA = a.score;
                const keyB = b.score;

                // Sort in descending order
                return keyB - keyA;
            })
            .slice(0, LIMIT);
        const mean_messages =
            messages_data.reduce((total, data) => total + data.score, 0) /
            messages_data.length;

        // sorting story_likes_data
        story_likes_data = sortLikedData(story_likes_data);
        const mean_story = calcMean(story_likes_data);

        // sorting liked_posts_data
        liked_posts_data = sortLikedData(liked_posts_data);
        const mean_posts = calcMean(liked_posts_data);

        // sorting liked_threads_data
        liked_threads_data = sortLikedData(liked_threads_data);
        const mean_threads = calcMean(liked_threads_data);

        const output_data = {
            mean_messages,
            mean_story,
            mean_posts,
            mean_threads,
            user_name: your_user_name,
            total_messages: total_messages,
            total_reacts_and_stickers: total_reacts_and_stickers,
            top_inbox: messages_data,
            top_story_likes: story_likes_data,
            total_story_likes: total_story_likes,
            total_story_likes_ppl: total_story_likes_ppl,
            total_messages_ppl: total_messages_ppl,
            top_post_likes: liked_posts_data,
            top_thread_likes: liked_threads_data,
            total_post_likes_ppl,
            total_post_likes,
            total_thread_likes_ppl,
            total_thread_likes,
            blocked_number: blocked_number,
            followers_list: followers_list,
            restricted_number: restricted_number,
            imageURL: imageURL,
        };

        console.log(output_data);
        dataPopulation(output_data);
    } catch (error) {
        console.error('Error:', error);
        logmessage(
            `- Á đù! lỗi này ảo thật - xin bạn hãy report lại cho @bao.anh.bui trên instagram để sửa lỗi <br> - Chi tiết lỗi: ${error}<br><br>`
        );
    }
}

function calcMean(arr) {
    if (arr.length == 0) {
        return 0;
    }
    return arr.reduce((total, data) => total + data[1], 0) / arr.length;
}

function calcTimeScore(timestamp) {
    const out = startTimestamp
        ? (timestamp - startTimestamp) / 26300160000 + 1
        : 1;
    return out;
}

function sortLikedData(data) {
    return Object.entries(data)
        .sort((a, b) => b[1] - a[1]) // Sort in descending order based on the values
        .slice(0, LIMIT)
        .filter((a) => a[0] !== your_user_name);
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
        pauseButtonText.innerText = 'Dừng animation';
        pauseButtonIcon.innerText = 'pause';
        paused = false;
    } else {
        pauseButtonText.innerText = 'Chạy animation';
        pauseButtonIcon.innerText = 'play_arrow';
        paused = true;
    }
}

function lightEl(i) {
    return `<light>${i}.</light>`;
}

function span(txt) {
    return `<span class="name">${txt}</span>`;
}

function dataPopulation(yourData) {
    const main = document.querySelector('#main');
    document.querySelector('#instruction').classList.add('hidden');
    main.classList.remove('hidden');
    const topPeople = document.getElementById('top-people');
    const topStoryLikes = document.getElementById('top-story-likes');
    const topPostLikes = document.getElementById('top-post-likes');
    const topThreadLikes = document.getElementById('top-thread-likes');
    const totalMessages = document.getElementById('total-messages');
    const totalStoryLikes = document.getElementById(
        'total-reacts-and-stickers'
    );
    topPeople.innerHTML = '';
    topStoryLikes.innerHTML = '';
    totalMessages.innerHTML = '';
    totalStoryLikes.innerHTML = '';

    // populate top people
    for (let i = 0; i < yourData.top_inbox.length; i++) {
        const name = yourData.top_inbox[i].name;
        const num = yourData.top_inbox[i].score;
        let el = document.createElement('li');
        num <= yourData.mean_messages && el.classList.add('unimportant');
        let details = `${lightEl(i + 1)} ${span(name)}`;
        if (i <= 2) {
            const { hours, minutes } = secondsToHoursMinutes(
                yourData.top_inbox[i].call_duration
            );
            details = `
                <div class="details">
                <div  class="summary">${lightEl(i + 1)} ${span(name)}
                </div>
                <greenspan class="rmvscreenshot" onclick="togglehidden('info${i}');"><span>bấm để xem thêm</span></greenspan>
                <p id="info${i}" class="hidden rmvscreenshot">
                    ${
                        yourData.top_inbox[i].call == 0 ||
                        (hours == 0 && minutes == 0)
                            ? ''
                            : `+ ${yourData.top_inbox[i].call} lần và
                    ${
                        hours == 0 ? '' : `${hours} tiếng `
                    }${minutes} phút alo <br>`
                    }
                    + ${yourData.top_inbox[
                        i
                    ].messages.toLocaleString()} tin nhắn từ bạn
                </p>
                </div>`;
        }
        el.innerHTML = details;
        topPeople.appendChild(el);
    }

    // populate top story likes
    for (let i = 0; i < yourData.top_story_likes.length; i++) {
        const name = yourData.top_story_likes[i][0];
        const num = yourData.top_story_likes[i][1];
        let el = document.createElement('li');
        el.innerHTML = `${lightEl(i + 1)} ${at}${span(
            name
        )} <greenspan>(${num} tim)</greenspan>`;
        num <= yourData.mean_story && el.classList.add('unimportant');
        topStoryLikes.appendChild(el);
    }

    // populate top post likes
    for (let i = 0; i < yourData.top_post_likes.length; i++) {
        const name = yourData.top_post_likes[i][0];
        const num = yourData.top_post_likes[i][1];
        let el = document.createElement('li');
        el.innerHTML = `${lightEl(i + 1)} ${at}${span(
            name
        )} <greenspan>(${num} bài)</greenspan>`;
        num <= yourData.mean_posts && el.classList.add('unimportant');
        topPostLikes.appendChild(el);
    }

    // populate top thread likes
    if (yourData.top_thread_likes.length == 0) {
        topThreadLikes.previousElementSibling.remove();
        let el = document.createElement('li');
        el.innerHTML = `Hãy sử dụng Threads để xem thêm 👀`;
        topThreadLikes.appendChild(el);
    } else {
        for (let i = 0; i < yourData.top_thread_likes.length; i++) {
            const name = yourData.top_thread_likes[i][0];
            const num = yourData.top_thread_likes[i][1];
            let el = document.createElement('li');
            el.innerHTML = `${lightEl(i + 1)} ${at}${span(
                name
            )} <greenspan>(${num} thrét)</greenspan>`;
            num <= yourData.mean_threads && el.classList.add('unimportant');
            topThreadLikes.appendChild(el);
        }
    }

    // add 'che' click event
    main.addEventListener('click', function ({ target }) {
        if (
            target.closest('.block ol li > *') === target ||
            target.closest('.block ol li .summary > *') === target
        ) {
            target.parentElement.classList.toggle('che');
        }
    });

    // populate followers list
    randomfollowers();

    // populate total messages sent
    totalMessages.innerText = yourData.total_messages.toLocaleString();

    // populate total reacts and stickers sent
    totalStoryLikes.innerText = yourData.total_story_likes.toLocaleString();

    document.querySelector('#total_storylikes_ppl').innerText =
        yourData.total_story_likes_ppl.toLocaleString();

    document.querySelector('#total_messages_ppl').innerText =
        yourData.total_messages_ppl.toLocaleString();

    document.querySelector('#total_post_likes').innerText =
        yourData.total_post_likes.toLocaleString();

    document.querySelector('#total_post_likes_ppl').innerText =
        yourData.total_post_likes_ppl.toLocaleString();

    if (yourData.top_thread_likes.length == 0) {
        document.querySelector('#threadblockbottom h1').innerHTML =
            'Hãy sử dụng Threads <br> để xem thêm 👀';
        document.querySelector('#threadblockbottom blurb').remove();
    } else {
        document.querySelector('#total_thread_likes').innerText =
            yourData.total_thread_likes.toLocaleString();

        document.querySelector('#total_thread_likes_ppl').innerText =
            yourData.total_thread_likes_ppl.toLocaleString();
    }

    document.querySelector('#blocked-number').innerText =
        yourData.blocked_number.toLocaleString();

    document.querySelector(
        '#user-name'
    ).innerHTML = `${at}${yourData.user_name}`;

    document.querySelector('#vn').classList.remove('hidden');
    yourData.restricted_number > 0 &&
        (document.querySelector('#restricted').innerText = `(${
            yourData.blocked_number > 0 ? 'kèm' : 'nhưng có'
        } ${yourData.restricted_number} người bị restricted)`);

    yourData.imageURL &&
        ((document.querySelector('#profile-photo img').src = yourData.imageURL),
        document
            .querySelector('#profile-photo img')
            .classList.remove('hidden'));

    window.scrollTo({
        top: 0,
        behavior: 'smooth', // Use smooth scrolling
    });
}

function secondsToHoursMinutes(seconds) {
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);

    return { hours, minutes };
}

function getRandomItems(array, count) {
    for (let i = array.length - 1; i > array.length - count - 1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.slice(-count);
}

function randomfollowers() {
    const random_followers = getRandomItems(followers_list, 5);
    const random_followers_elem = document.querySelector('#followers-list');
    const thank_you_msg = document.querySelector('#thank-you');
    random_followers_elem.innerHTML = '';
    for (let i = 0; i < random_followers.length; i++) {
        let el = document.createElement('li');
        left = Math.random() * 100;
        el.style.left = `${left}%`;
        el.style.transform = `translateX(${-left}%)`;
        el.classList.add('randompos');
        el.innerHTML = `${at}${random_followers[i]}`;
        random_followers_elem.appendChild(el);
    }
    thank_you_msg.innerText = getRandomItems(thank_you_note, 1);
}

function screenshot(e) {
    document
        .querySelector('#saved-photo-gradient')
        .classList.add('removeAllCheThumb');
    e.innerHTML = 'chờ xíu';
    html2canvas(document.querySelector('#saved-photo-gradient'), {
        backgroundColor: style.getPropertyValue('--backgroundcolor'),
        onclone: (doc) => {
            let dom = [
                ...doc.querySelectorAll('.rmvscreenshot'),
                ...doc.querySelectorAll('button'),
            ];
            dom.forEach((elem) => {
                elem.remove();
            });
        },
    }).then((canvas) => {
        const capture = document.querySelector('#capture');
        capture.appendChild(canvas);
        capture.classList.remove('hidden');
        const dataUrl = canvas.toDataURL('image/png');

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = 'InstagramWrappedTiengViet.png'; // Specify the filename

        // Trigger a click on the download link to start the download
        downloadLink.click();
        document
            .querySelector('#saved-photo-gradient')
            .classList.remove('removeAllCheThumb');
        e.innerHTML =
            'ảnh đã được tự động lưu vào máy, nếu chưa, hãy kéo xuống dưới để lưu ảnh';
    });
}

function togglehidden(id) {
    document.querySelector('#' + id).classList.toggle('hidden');
}

onload = (e) => {
    getRandomBorderRadius('#saved-photo-gradient');
    getRandomBorderRadius('#container', 60);
    getRandomBorderRadius('#profile-photo');
    getRandomBorderRadius('#profile-photo img');
    getRandomBorderRadius('#blocked-section');
    getRandomBorderRadius('#blocked-row');
    getRandomBorderRadius('#follower-row');
    getRandomBorderRadius('#follower-note');
    getRandomBorderRadius('#blocked-note');
    getRandomBorderRadius('#footer', 30);
    getRandomBorderRadius('#thank-you', 50);
    getRandomBorderRadius('#mobile', 30);
    document.querySelectorAll('#instruction li img').forEach((elem) => {
        randomBorderRadius(elem, 70);
    });
    document.querySelectorAll('button').forEach((elem) => {
        randomBorderRadius(elem, 70);
    });
};

function getRandomBorderRadius(query, max = 100) {
    elem = document.querySelector(query);
    randomBorderRadius(elem, max);
}

function randomBorderRadius(elem, max = 100) {
    elem.style.borderRadius = `${Math.random() * max}% ${
        Math.random() * max
    }% ${Math.random() * max}% ${Math.random() * max}% / ${
        Math.random() * max
    }% ${Math.random() * max}% ${Math.random() * max}% ${Math.random() * max}%`;
}

function msgFile(name, error) {
    return `- :/ cái file ${name} này không tồn tại - :/ Bạn có chắc bạn chọn đúng folder không? Đảm bảo rằng folder bạn chọn là folder chứa mấy cái folder con bên trong ví dự như 'personal_information', 'messages', 'followers_and_following',... Bạn có thể thử tải lại/giải nén lại file zip <br>- Chi tiết lỗi: ${error}<br><br>`;
}

function msgFolder(name, error) {
    return `- :/ cái folder ${name} này không tồn tại - :/ Bạn có chắc bạn chọn đúng folder không? Đảm bảo rằng folder bạn chọn là folder chứa mấy cái folder con bên trong ví dự như 'personal_information', 'messages', 'followers_and_following',... Bạn có thể thử tải lại/giải nén lại file zip <br>- Chi tiết lỗi: ${error}<br><br>`;
}

function excludeFolder(key) {
    return ['facebook', 'threads'].some((txt) => key.includes(txt));
}
