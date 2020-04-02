let toColorCell;
let toDarkenOnRepeat;
const defaultColorMode = 'random';
let currentColorMode;
let currentHue;

function defineNewHeight(height) {
    const element = document.querySelector(':root');
    element.style.setProperty('--sketchpad-height', `${height}`);
}

function addCell(type, className = '') {
    let element = document.createElement(type);
    if (className) {
        element.classList.add(className);
    }
    return element
}

function buildSketchpad(height) {
    const sketchpadElement = document.querySelector('#sketchpad');
    while (sketchpadElement.firstChild) {
        sketchpadElement.removeChild(sketchpadElement.lastChild);
    }
    let cell;
    defineNewHeight(height);
    for (let index = 0; index < height**2; index++) {
        cell = addCell('div','sketchpad-cell');
        sketchpadElement.appendChild(cell);
    }
}

function resizeSketchpad() {
    let height = prompt('How tall/wide should the sketchpad be? Please enter an integer between 16 and 100.\nWARNING: The current sketchpad will be cleared!');
    if (Number.isInteger(Number(height)) && Number(height) >= 16 && Number(height) <= 100) {
        buildSketchpad(height);
        enableInteraction();
        if (currentColorMode == 'eraser') {
            currentColorMode = defaultColorMode;
        }
    } else if (height != null) {
        alert('Please enter an integer between 16 and 100!');
        resizeSketchpad();
    }
}

function clearSketchpad() {
    let confirmClear = confirm('Clear sketchpad?');
    if (confirmClear) {
        let cells = document.querySelectorAll('.sketchpad-cell');
        cells.forEach((cell) => {
            eraseCellColor(cell);
        })
        if (currentColorMode == 'eraser') {
            currentColorMode = defaultColorMode;
        }
    }
}

function generateRandomHSL() {
    let hue, sat, light;
    hue = Math.floor(Math.random()*360); // 0 to 359
    sat = Math.floor(Math.random()*71) + 30; // 30 to 100
    light = Math.floor(Math.random()*41) + 30; // 30 to 70
    return {hue, sat, light};
}

function generateRainbowHSL() {
    currentHue = (currentHue == null || currentHue === 350) ? 0 : (currentHue + 10);

    let hue, sat, light;
    hue = currentHue;
    sat = 70;
    light = 50;
    return {hue, sat, light};
}

function generateCustomHSL() {

}

function setCellHSL(cell, hue, sat, light) {
    cell.dataset.hue = `${hue}`;
    cell.dataset.sat = `${sat}`;
    cell.dataset.light = `${light}`;
    cell.style.backgroundColor = `hsl(${hue}, ${sat}%, ${light}%)`;
    cell.classList.add('colored');
}

function getCellHSL(cell) {
    let hue, sat, light;
    hue = Number(cell.dataset.hue);
    sat = Number(cell.dataset.sat);
    light = Number(cell.dataset.light);
    return {hue, sat, light};
}

function eraseCellColor(cell) {
    cell.removeData;
    cell.style.backgroundColor = 'var(--sketchpad-color)';
    cell.classList.remove('colored');
}

function darkenCell(cell) {
    let {hue, sat, light} = getCellHSL(cell);
    light = Math.round(0.85*light);
    setCellHSL(cell, hue, sat, light);
}

function updateCellColor(cell) {
    if (toColorCell) {
        if (currentColorMode == 'eraser') {
            eraseCellColor(cell);
        } else if (cell.classList.contains('colored') && toDarkenOnRepeat) {
            darkenCell(cell);
        } else {
            let hsl;
            switch (currentColorMode) {
                case 'random':
                    hsl = generateRandomHSL();
                    break;
                case 'rainbow':
                    hsl = generateRainbowHSL();
                    break;
                case 'custom':
                    hsl = generateCustomHSL();
            }
            setCellHSL(cell, hsl.hue, hsl.sat, hsl.light);
        }
    }
}

function enableInteraction() {
    let cells = document.querySelectorAll('.sketchpad-cell');
    cells.forEach((cell) => {
        cell.addEventListener('click', () => {
            toColorCell = !toColorCell;
            updateCellColor(cell);
        });
        cell.addEventListener('mouseover', () => updateCellColor(cell));
    })
}

function enableButtons() {
    const customBtn = document.querySelector('#custom-button');
    customBtn.addEventListener('click', () => {
        currentColorMode = 'custom';
    })
    const randomBtn = document.querySelector('#random-button');
    randomBtn.addEventListener('click', () => {
        currentColorMode = 'random';
    })
    const rainbowBtn = document.querySelector('#rainbow-button');
    rainbowBtn.addEventListener('click', () => {
        currentHue = (currentColorMode != 'rainbow') ? 0 : currentHue;
        currentColorMode = 'rainbow';
    })
    const eraserBtn = document.querySelector('#eraser-button');
    eraserBtn.addEventListener('click', () => {
        currentColorMode = 'eraser';
    })
    const darkenToggle = document.querySelector('#darken-toggle');
    darkenToggle.addEventListener('click', () => {
        toDarkenOnRepeat = !toDarkenOnRepeat;
    })
    const resizeBtn = document.querySelector('#resize-button');
    resizeBtn.addEventListener('click', () => resizeSketchpad());
    
    const clearBtn = document.querySelector('#clear-button');
    clearBtn.addEventListener('click', () => clearSketchpad());
}

function load(height) {
    currentColorMode = defaultColorMode;
    toDarkenOnRepeat = false;
    toColorCell = false;
    buildSketchpad(height);
    enableInteraction();
    enableButtons();
}

load(16);