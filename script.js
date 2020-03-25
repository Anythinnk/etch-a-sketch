function defineNewHeight(height) {
    let element = document.querySelector(':root');
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
    let sketchpadElement = document.querySelector('#sketchpad');
    let cell;
    defineNewHeight(height);
    for (let index = 0; index < height**2; index++) {
        cell = addCell('div','sketchpad-cell');
        sketchpadElement.appendChild(cell);
    }
}

buildSketchpad(16);