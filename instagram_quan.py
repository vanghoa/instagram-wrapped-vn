"""
Run this script after downloading Messenger data from
January 1 2020 - December 1 2020 (or some later date in 2020)
in JSON format. Put the `messages` folder in the `2020messengerwrapped`
directory.

In this directory: run `python generate_messenger_wrapped.py`
to generate the file that index.html will use to generate
your 2020 Messenger Wrapped!
"""

import json
import os
import string
import sys
import webbrowser
from htmlparse import html

MESSENGER_DIR = './data/messages/inbox'
OUTPUT_FILE_DIR = './js'
OUTPUT_FILENAME = 'your_messenger_wrapped.js'
NUM_TOP_PEOPLE_AND_PHRASES = 10
NUM_PEOPLE_TO_PRINT = 25
NUM_PHRASES_TO_PRINT = 100
include_group_chats = True
total_messages = 0
total_storylikes = 0
total_storylikes_ppl = 0
total_reacts_and_stickers = 0
people = {}
call = {}
phrases = {}
storylikes = {}
top_people = []
top_phrases = []
senders_to_omit = []
phrase_length = 4 # default: 4
your_name = ''
default_people = {'call': 0, 'messages': 0, 'call_duration': 0}
script_directory = os.path.dirname(os.path.abspath(__file__))

def get_file_path(file_name):
    """Constructs a file path based on the given directory and file name."""
    if getattr(sys, 'frozen', False):  # Check if the script is running as an executable
        script_directory = os.path.dirname(sys.executable)
    else:
        script_directory = os.path.dirname(os.path.abspath(__file__))

    return os.path.join(script_directory, file_name)

if __name__ == "__main__":
  folder_path = get_file_path('./data')
  # check if folder exists
  if not (os.path.exists(folder_path) and os.path.isdir(folder_path)):
      print(f"Lỗi :((((((( không tìm thấy folder 'data' của bạn")
      sys.exit(1)

  # get your_name
  with open(get_file_path('data/personal_information/personal_information.json')) as file:
    your_name = json.load(file)["profile_user"][0]["string_map_data"]["Name"]["value"]

  # get story_likes
  with open(get_file_path('data/story_sticker_interactions/story_likes.json')) as file: 
    data = json.load(file)["story_activities_story_likes"]
    for item in data:
      storylikes.setdefault(item["title"], 0)
      storylikes[item["title"]] += 1
      total_storylikes += 1

  messenger_directory = get_file_path(MESSENGER_DIR)

  for dir, _, files in os.walk(messenger_directory):
    for file in files:
      if file.startswith('message_') and file.endswith('.json'):
        with open(os.path.join(dir, file)) as json_file:
          data = json.load(json_file)

          default_name = data['participants'][0]['name'].encode('iso-8859-1').decode('utf-8')

          is_group_chat = len(data['participants']) > 2
          # Track number of messages sent by different people
          for m in data['messages']:
            sender_name = m['sender_name'].encode('iso-8859-1').decode('utf-8')

            # only count messages towards top senders if it satisfies user's preference
            if (sender_name == your_name):
              total_messages += 1
            elif sender_name != 'Instagram User' and sender_name != your_name and not is_group_chat:
              people.setdefault(sender_name, default_people.copy())
              people[sender_name]['messages'] += 1

            if 'call_duration' in m and default_name != 'Instagram User' and not is_group_chat:
              people[default_name]['call_duration'] += m['call_duration']
              people[default_name]['call'] += 1
              
            # Track reacts that you give
            if 'reactions' in m:
              for react in m['reactions']:
                if react['actor'] == your_name:
                  total_reacts_and_stickers = total_reacts_and_stickers + 1

            # Also track stickers that you send
            if 'sticker' in m and sender_name == your_name:
              total_reacts_and_stickers = total_reacts_and_stickers + 1
              
            
  # remove ignored senders from the list
  for sender_name in senders_to_omit:
    people.pop(sender_name, None)

  people = [{'name': name, **data} for name, data in people.items()]
  people = sorted(people, key=lambda x: x['messages'] + x['call_duration'] / 10 + x['call'] * 10, reverse=True)[:NUM_TOP_PEOPLE_AND_PHRASES]
  total_storylikes_ppl = len(storylikes)
  storylikes = sorted(storylikes.items(), key=lambda x: x[1], reverse=True)[:NUM_TOP_PEOPLE_AND_PHRASES]

  output_data = {
    "total_messages": total_messages,
    "total_reacts_and_stickers": total_reacts_and_stickers,
    "share_names": True,
    "top_people": people,
    "top_phrases": top_phrases,
    "story_likes": storylikes,
    "total_storylikes": total_storylikes,
    "total_storylikes_ppl": total_storylikes_ppl
  }

  json_string = json.dumps(output_data, indent=2)

  with open(get_file_path('./your_instagram_quan_is_here.html'), "w", encoding="utf-8") as html_file:
    html_file.write(html(json_string))

  print(get_file_path('your_instagram_quan_is_here.html'))
  webbrowser.open_new_tab('file://' + get_file_path('your_instagram_quan_is_here.html'))