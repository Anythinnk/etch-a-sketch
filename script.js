let toColorCell;

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
    let cell;
    defineNewHeight(height);
    for (let index = 0; index < height**2; index++) {
        cell = addCell('div','sketchpad-cell');
        sketchpadElement.appendChild(cell);
    }
}

function generateRandomHSL() {
    let hue, sat, light;
    hue = Math.floor(Math.random()*360); // 0 to 359
    sat = Math.floor(Math.random()*71) + 30; // 30 to 100
    light = Math.floor(Math.random()*41) + 30; // 30 to 70
    return {hue, sat, light};
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

function darkenCell(cell) {
    let {hue, sat, light} = getCellHSL(cell);
    light = Math.round(0.85*light);
    setCellHSL(cell, hue, sat, light);
}

function updateCellColor(cell) {
    if (toColorCell) {
        if (cell.classList.contains('colored')) {
            darkenCell(cell);
        } else {
            let {hue, sat, light} = generateRandomHSL();
            setCellHSL(cell, hue, sat, light);
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

function load(height) {
    toColorCell = false;
    buildSketchpad(height);
    enableInteraction();
}

load(16);