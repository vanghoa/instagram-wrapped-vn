
def html(json_string):
  return '''
  <!DOCTYPE html>
  <html>
      <head>
          <title>Messenger Wrapped</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
              href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap"
              rel="stylesheet"
          />
          <style>
          body {
              font-family: 'Montserrat', sans-serif;
              font-size: 14px;
          }

          #background {
              position: absolute;
              left: 0;
              top: 0;
              z-index: -1;
          }

          greenspan {
              display: inline;
              font-weight: 100;
          }

          body {
              height: 100vh;
              margin: 0 auto;
              display: flex;
              justify-content: center;
              align-items: center;
              max-width: 400px;
              z-index: 1;
          }

          #body-gradient {
              width: 100vw;
              min-height: 900px;
              height: 100%;
              position: absolute;
              background: rgb(84, 32, 172);
              background-size: cover;
              background-repeat: no-repeat;
          }

          #saved-photo-gradient {
              width: 600px;
              height: 900px;
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              margin: auto;
              background: rgb(229, 129, 46);
          }

          #container {
              width: 500px;
              height: fit-content;
              border-radius: 8px;
              background-color: rgb(238, 170, 213);
              color: rgb(19, 20, 18);
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              margin: auto;
          }

          h1 {
              color: rgb(19, 20, 18);
              font-size: 14px;
              font-weight: 500;
          }

          ol {
              padding-left: 0;
              margin-left: 0;
              list-style: none;
              font-weight: 700;
          }

          blurb {
              font-weight: 700;
          }

          li {
              counter-increment: custom;
          }

          ol li:before {
              content: counter(custom) ' ';
              padding-right: 4px;
          }

          ol li:first-child {
              counter-reset: custom;
          }

          li::marker {
              color: rgb(19, 20, 18);
          }

          #profile-photo {
              width: 235px;
              height: 235px;
              background: rgb(245, 228, 51);
              display: block;
              position: relative;
              margin-left: auto;
              margin-right: auto;
              margin-top: 26px;
              z-index: 2;
          }

          #profile-photo img {
              width: 150px;
              height: 150px;
              z-index: 3;
              position: absolute;
              top: 42.5px;
              left: 42.5px;
          }

          .row {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              margin: 0px 19px;
          }

          #top-row {
              margin-top: 14px;
              height: 250px;
          }

          #bottom-row p {
              font-size: 30px;
              margin: auto;
          }

          .block {
              width: 100%;
              flex-shrink: 1;
              flex-grow: 1;
          }

          .block p {
              font-weight: 700;
          }

          #footer {
              background-color: rgb(238, 170, 213);
              color: rgb(19, 20, 18);
              font-size: 14px;
              padding: 26px 15px;
              bottom: 0;
              border-bottom-left-radius: 7px;
              border-bottom-right-radius: 7px;
          }

          #footer a:link,
          a:visited {
              color: rgb(19, 20, 18);
          }

          #pause-button {
              top: 50px;
              font-size: 36px;
              border-radius: 0;
              border: 0;
              padding: 20px 25px;
              z-index: 3;
              position: fixed;
              right: 50px;
              color: rgb(255, 255, 255);
              background: rgb(84, 32, 172);
              font-family: Montserrat, sans-serif;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
          }

          #pause-button:hover {
              background-color: rgb(19, 20, 18);
          }

          #pause-button-icon {
              font-size: 36px;
              margin-right: 8px;
          }
          </style>
          <link
              rel="icon"
              href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💬</text></svg>"
          />
          <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0"
          />
          <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0"
          />
          <script
              src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.5.0/p5.min.js"
              integrity="sha512-WJXVjqeINVpi5XXJ2jn0BSCfp0y80IKrYh731gLRnkAS9TKc5KNt/OfLtu+fCueqdWniouJ1ubM+VI/hbo7POQ=="
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
          ></script>
          <script>yourData=''' + json_string + '''</script>
          <script>
          const SHAPES = ["circle","square", "triangle"];
          const COLORS = ["orange", "pink", "green", "yellow", "black", "purple"];
          const NUM_SHAPE_LAYERS = getRandom(5,8);
          const MIN_OBJ = 4;
          const MAX_OBJ = 20;
          const PFP_SIZE = 235;
          const FRAME_RATE = 4;
          const HOLD_LENGTH = FRAME_RATE;
          let pContent;
          let currLayerNumber = 0;
          let holdCount = 1;
          let numLayersToDraw = 0;
          let countingUp = true;
          let holding = false;
          let paused = false;

          class ShapeBackground {
            constructor(width, height) {
              this.width = width;
              this.height = height;
              this.colors = this.getColors();
              this.numObj = this.getNumObj();
              this.shapes = this.getShapes();
              this.sizes = this.getSizes();
              this.radii = this.getRadii();
            }

            reset() {
              this.colors = this.getColors();
              this.numObj = this.getNumObj();
              this.shapes = this.getShapes();
              this.sizes = this.getSizes();
              this.radii = this.getRadii();
            }

            getColors() {
              let lastColor = "";
              let localColors = [];
              for (let i = 0; i < NUM_SHAPE_LAYERS; i++) {
                let tempIdx = Math.floor(getRandom(0,5));
                let tempColor = COLORS[tempIdx];
                while (tempColor === lastColor) {
                  tempColor = COLORS[Math.floor(getRandom(0,5))];
                }
                localColors.push(tempColor);
                lastColor = tempColor;
              }
              return localColors;
            }

            getNumObj() {
              let localNumObj = [];
              for (let i = 0; i < NUM_SHAPE_LAYERS; i++) {
                localNumObj.push(Math.floor(getRandom(MIN_OBJ, MAX_OBJ + 1)));
              }
              return localNumObj;
            }

            getShapes() {
              let lastShape = "";
              let localShapes = [];
              for (let i = 0; i < NUM_SHAPE_LAYERS; i++) {
                let tempShape = SHAPES[Math.floor(getRandom(0,SHAPES.length-1))];

                localShapes.push(tempShape);
                lastShape = tempShape;
              }
              return localShapes;
            }

            getRadii() {
              let localRadii = [];
              let currRadii = Math.max(this.width, this.height)/2;
              let currIncrement = 0;
              for (let i = 0; i < NUM_SHAPE_LAYERS; i++) {
                localRadii.push(currRadii - currIncrement);
                currIncrement += (8 + Math.floor(getRandom(0,this.width/16)));
              }
              return localRadii;
            }

            getSizes() {
              let localSizes = [];
              for (let i = 0; i < NUM_SHAPE_LAYERS; i++) {
                localSizes.push(Math.floor(getRandom(this.width/16, this.width/2)));
              }
              return localSizes;
            }

            buildBackground(i) { // i = layer number
              const c = this.getCurrColor(this.colors[i]);
              fill(c);
              if (this.shapes[i] === 'square') {
                for (let j = 0; j < this.numObj[i]; j++) {
                  push();
                  translate(PFP_SIZE/2, PFP_SIZE/2);
                  rotate(TWO_PI * j / this.numObj[i]);
                  rect(this.radii[i], 0, this.sizes[i], this.sizes[i]);
                  pop();
                }
              } else if (this.shapes[i] === 'circle') {
                for (let j = 0; j < this.numObj[i]; j++) {
                  push();
                  translate(PFP_SIZE/2, PFP_SIZE/2);
                  rotate(TWO_PI * j / this.numObj[i]);
                  circle(this.radii[i], 0, this.sizes[i]);
                  pop();
                }
              } else { // triangle
                for (let j = 0; j < this.numObj[i]; j++) {
                  push();
                  translate(PFP_SIZE/2, PFP_SIZE/2);
                  rotate(TWO_PI * j / this.numObj[i]);
                  triangle(
                    this.radii[i], this.radii[i],
                    0,40,
                    40,10
                  );
                  pop();
                }
              }
            }

            getCurrColor(c) {
              let nc;
              if (c === 'orange') {
                nc = color(229,129,46);
              } else if (c === 'pink') {
                nc = color(226,116,186);
              } else if (c === 'green') {
                nc = color(89,204,96);
              } else if (c === 'yellow') {
                nc = color(245,252,89);
              } else if (c === 'black') {
                nc = color(19,20,18);
              } else { // purple
                nc = color(84,32,172);
              }
              return nc;
            }
          }

          function setup() {
            pCnv = createCanvas(PFP_SIZE, PFP_SIZE);
            pCnv.parent(document.getElementById("profile-photo"));
            rectMode(CENTER);
            noStroke();
            pContent = new ShapeBackground(PFP_SIZE, PFP_SIZE);
            frameRate(FRAME_RATE);
            background(color(84,32,172));
          }

          function draw() {
            if (!paused) {
              background(color(84,32,172));
              for (let i = 0; i < currLayerNumber; i++) {
                pContent.buildBackground(i);
              }

              if (countingUp) {
                if (!holding) {
                  currLayerNumber = Math.min(currLayerNumber + 1, NUM_SHAPE_LAYERS);
                  if (currLayerNumber === NUM_SHAPE_LAYERS) {
                    holding = true;
                  }
                } else {
                  holdCount += 1;
                  if (holdCount > HOLD_LENGTH) {
                    holdCount = 0;
                    holding = false;
                    countingUp = false;
                  }
                }
              } else {
                currLayerNumber = Math.max(currLayerNumber - 1, 0);
                if (currLayerNumber === 0) {
                  countingUp = true;
                  pContent.reset();
                }
              }
            }
          }

          function getRandom(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
          }
                  </script>
                  <script>
                  /*
          * Fills html page with information
          in the json file generated.
          */

          // for retrieving content from generated js file
          const TOP_PEOPLE = 'top_people';
          const TOTAL_REACTS_AND_STICKERS = 'total_reacts_and_stickers';
          const TOTAL_MESSAGES = 'total_messages';
          const TOP_PHRASES = 'top_phrases';
          const SHARE_NAMES = 'share_names';
          const CUSTOM_IMAGE = 'custom_image';
          const storylikes = 'story_likes';
          const total_storylikes = 'total_storylikes';
          const total_storylikes_ppl = 'total_storylikes_ppl';

          window.onload = function () {
              const topPeopleHeading = document.getElementById(
                  'top-people-or-num-messages-sent'
              );
              const topPeople = document.getElementById('top-people');
              const topPhrases = document.getElementById('top-phrases');
              const totalMessages = document.getElementById('total-messages');
              const totalReactsAndStickers = document.getElementById(
                  'total-reacts-and-stickers'
              );
              const pauseButton = document.getElementById('pause-button');
              pauseButton.addEventListener('click', pauseStartAnimation);

              // if person chose to show names, set heading to be "top people".
              // if person chose to show number of messages that their top people sent,
              // set heading to be "top number of messages others sent"
              if (!yourData[SHARE_NAMES]) {
                  topPeopleHeading.innerText = 'Top # Messages Others Sent';
              }

              // populate top people
              for (let i = 0; i < yourData[TOP_PEOPLE].length; i++) {
                  let el = document.createElement('li');
                  el.innerText = yourData[TOP_PEOPLE][i].name;
                  topPeople.appendChild(el);
              }

              // populate top phrases
              for (let i = 0; i < yourData[storylikes].length; i++) {
                  let el = document.createElement('li');
                  let greenspan = document.createElement('greenspan');
                  greenspan.innerText = `(${yourData[storylikes][i][1]})`;
                  el.innerText = `${yourData[storylikes][i][0]} `;
                  el.appendChild(greenspan);
                  topPhrases.appendChild(el);
              }

              // populate total messages sent
              totalMessages.innerText = yourData[TOTAL_MESSAGES].toLocaleString();

              // populate total reacts and stickers sent
              totalReactsAndStickers.innerText =
                  yourData[total_storylikes].toLocaleString();

              document.querySelector('#total_storylikes_ppl').innerText =
                  yourData[total_storylikes_ppl].toLocaleString();
          };

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
          </script>
      </head>
      <body>
          <div id="body-gradient">
              <div id="saved-photo-gradient">
                  <div
                      id="container"
                      style="display: flex; flex-direction: column; gap: 20px"
                  >
                      <div id="profile-photo">
                          <h1
                              style="
                                  position: absolute;
                                  width: 500px;
                                  left: 50%;
                                  top: 50%;
                                  transform: translate(-50%, -50%);
                                  font-size: 60px;
                                  text-align: center;
                                  color: white;
                                  z-index: 20;
                                  font-weight: 900;
                                  margin: 0;
                                  padding: 0;
                                  line-height: 1em;
                              "
                          >
                              Instagram Quấn 2023
                          </h1>
                          <!-- @anotherbrowsertab took this photo of the ducks -->
                      </div>
                      <div id="top-row" class="row">
                          <div class="block">
                              <h1 id="top-people-or-num-messages-sent">
                                  Top inbox
                              </h1>
                              <ol id="top-people"></ol>
                          </div>
                          <div class="block">
                              <h1>Bạn thả tim story của ai nhiều nhất?</h1>
                              <ol id="top-phrases"></ol>
                          </div>
                      </div>
                      <div id="bottom-row" class="row">
                          <div class="block">
                              <h1>Bạn đã gửi</h1>
                              <p id="total-messages"></p>
                              <blurb>tin nhắn</blurb>
                          </div>
                          <div class="block">
                              <h1>Bạn đã thả</h1>
                              <p id="total-reacts-and-stickers"></p>
                              <blurb
                                  >trái tim cho
                                  <span id="total_storylikes_ppl"></span>
                                  người</blurb
                              >
                          </div>
                      </div>
                      <div id="footer">
                          by <b>@bao.anh.bui</b> forked from
                          <b>@anotherbrowsertab</b>
                      </div>
                  </div>
              </div>
              <a id="pause-button">
                  <span id="pause-button-icon" class="material-symbols-outlined"
                      >pause</span
                  >
                  <span id="pause-button-text">Pause</span>
              </a>
          </div>
      </body>
  </html>
  '''