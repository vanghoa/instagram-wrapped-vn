if (top != self) {
    document.body.innerHTML = '';
}

const style = getComputedStyle(document.body);

const SHAPES = ['circle', 'square', 'triangle'];
const COLORS = [
    style.getPropertyValue('--orange'),
    style.getPropertyValue('--lightpurple'),
    style.getPropertyValue('--backgroundcolor'),
    style.getPropertyValue('--turquoise'),
    style.getPropertyValue('--pink'),
    style.getPropertyValue('--yellow'),
    style.getPropertyValue('--blue'),
    'black',
];
const NUM_SHAPE_LAYERS = getRandom(5, 8);
const MIN_OBJ = 4;
const MAX_OBJ = 20;
const profile_data = document.querySelector('#profile-photo');
const PFP_SIZE = {
    w: profile_data.clientWidth * 2,
    h: profile_data.clientHeight * 3,
};
const FRAME_RATE = 4;
const HOLD_LENGTH = FRAME_RATE;
let pContent;
let currLayerNumber = 0;
let holdCount = 1;
let numLayersToDraw = 0;
let countingUp = true;
let holding = false;
let paused = false;
const purple = [138, 43, 226];
const blue = [0, 183, 192];
const green = [55, 175, 22];
const pink = [255, 0, 179];
const blue_ = [0, 27, 199];
const yellow = [208, 149, 0];

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
        let lastColor = '';
        let localColors = [];
        for (let i = 0; i < NUM_SHAPE_LAYERS; i++) {
            let tempIdx = Math.floor(getRandom(0, 5));
            let tempColor = COLORS[tempIdx];
            while (tempColor === lastColor) {
                tempColor = COLORS[Math.floor(getRandom(0, 5))];
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
        let lastShape = '';
        let localShapes = [];
        for (let i = 0; i < NUM_SHAPE_LAYERS; i++) {
            let tempShape = SHAPES[Math.floor(getRandom(0, SHAPES.length - 1))];

            localShapes.push(tempShape);
            lastShape = tempShape;
        }
        return localShapes;
    }

    getRadii() {
        let localRadii = [];
        let currRadii = Math.max(this.width, this.height) / 2;
        let currIncrement = 0;
        for (let i = 0; i < NUM_SHAPE_LAYERS; i++) {
            localRadii.push(currRadii - currIncrement);
            currIncrement += 8 + Math.floor(getRandom(0, this.width / 16));
        }
        return localRadii;
    }

    getSizes() {
        let localSizes = [];
        for (let i = 0; i < NUM_SHAPE_LAYERS; i++) {
            localSizes.push(
                Math.floor(getRandom(this.width / 16, this.width / 2))
            );
        }
        return localSizes;
    }

    buildBackground(i) {
        // i = layer number
        const c = this.colors[i];
        fill(c);
        if (this.shapes[i] === 'square') {
            for (let j = 0; j < this.numObj[i]; j++) {
                push();
                translate(PFP_SIZE.w / 2, PFP_SIZE.h / 2);
                rotate((TWO_PI * j) / this.numObj[i]);
                rect(this.radii[i], 0, this.sizes[i], this.sizes[i]);
                pop();
            }
        } else if (this.shapes[i] === 'circle') {
            for (let j = 0; j < this.numObj[i]; j++) {
                push();
                translate(PFP_SIZE.w / 2, PFP_SIZE.h / 2);
                rotate((TWO_PI * j) / this.numObj[i]);
                circle(this.radii[i], 0, this.sizes[i]);
                pop();
            }
        } else {
            // triangle
            for (let j = 0; j < this.numObj[i]; j++) {
                push();
                translate(PFP_SIZE.w / 2, PFP_SIZE.h / 2);
                rotate((TWO_PI * j) / this.numObj[i]);
                triangle(this.radii[i], this.radii[i], 0, 40, 40, 10);
                pop();
            }
        }
    }
}

function setup() {
    pCnv = createCanvas(PFP_SIZE.w, PFP_SIZE.h);
    pCnv.parent(document.getElementById('profile-photo'));
    rectMode(CENTER);
    noStroke();
    pContent = new ShapeBackground(PFP_SIZE.w / 2.5, PFP_SIZE.h / 2.5);
    frameRate(FRAME_RATE);
    background('black');
}

function draw() {
    if (!paused) {
        //background(color(...purple));
        for (let i = 0; i < currLayerNumber; i++) {
            pContent.buildBackground(i);
        }

        if (countingUp) {
            if (!holding) {
                currLayerNumber = Math.min(
                    currLayerNumber + 1,
                    NUM_SHAPE_LAYERS
                );
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
