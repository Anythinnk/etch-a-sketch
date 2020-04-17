const rootEle = document.querySelector(':root');
const displayArea = document.querySelector('#current-color');
const defaultColorMode = 'rainbow';
const startingPickerColor = '#000000';
let gridlinesOn;
let toColorCell;
let toDarkenOnRepeat;
let currentColorMode;
let currentHue;
let customHEX;

function defineNewHeight(height) {
    rootEle.style.setProperty('--sketchpad-height', `${height}`);
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

function toggleGridSketchpad() {
    let cells = document.querySelectorAll('.sketchpad-cell');
    cells.forEach((cell) => {
        cell.classList.toggle('no-border');
    })
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

function refreshColorInput(event) {
    customHEX = event.target.value;
    if (currentColorMode === 'custom') {
        displayColorMode('custom');
    }
}

function hexToHSL(hex) {
	// hex to rgb
	let r = 0, g = 0, b = 0;
	if (hex.length == 4) {
		r = `0x${hex[1]}${hex[1]}`;
		g = `0x${hex[2]}${hex[2]}`;
		b = `0x${hex[3]}${hex[3]}`;
	} else if (hex.length == 7) {
		r = `0x${hex[1]}${hex[2]}`;
		g = `0x${hex[3]}${hex[4]}`;
		b = `0x${hex[5]}${hex[6]}`;
	}
	// rgb to hsl
	r /= 255;
	g /= 255;
	b /= 255;
	
	let cmin = Math.min(r, g, b),
		cmax = Math.max(r, g, b),
		delta = cmax - cmin,
		hue,
		sat,
		light = (cmax + cmin)/2;
	
	if (delta == 0) {
		hue = 0;
		sat = 0;
	} else {
		sat = (light > 0.5) ? (delta/(2 - cmax - cmin)) : (delta/(cmax + cmin));
		switch (cmax) {
			case r:
				hue = (g - b)/delta + ((g < b) ? 6 : 0);
				break;
			case g:
				hue = (b - r)/delta + 2;
				break;
			case b:
				hue = (r - g)/delta + 4;
				break;
		}
		hue /= 6;
	}
	
	hue *= 360;
	hue = Math.round(hue);
	sat *= 100;
	sat = Math.round(sat);
	light *= 100;
	light = Math.round(light);
	
	return {hue, sat, light};
}

function generateCustomHSL() {
	let {hue, sat, light} = hexToHSL(customHEX);
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

function setColorMode(modeStr) {
    if (currentColorMode != modeStr) {
        let prevColorMode = currentColorMode;
        currentColorMode = modeStr;
        displayColorMode(currentColorMode);
        updateColorBtns(prevColorMode, currentColorMode);
    }
}

function updateColorBtns(...args) {
    args.forEach((str) => {
        let btn = document.querySelector(`#${str}-button`);
        btn.classList.toggle('unpressed');
    });
}

function gradientStrRandomColors(numColors, angleStr = 'to right') {
    let finalStr = `linear-gradient(${angleStr}`;
    let percentageJump = 100/numColors;
    for (let i = 0; i < numColors; i++) {
        let {hue, sat, light} = generateRandomHSL();
        finalStr += `, hsl(${hue}, ${sat}%, ${light}%) ${Math.round(percentageJump*i*10)/10}% ${Math.round(percentageJump*(i + 1)*10)/10}%`;
    }
    return finalStr;
}

function toggleDarken() {
    toDarkenOnRepeat = !toDarkenOnRepeat;
    displayArea.classList.toggle('darken');
}

function enableInteraction() {
    let cells = document.querySelectorAll('.sketchpad-cell');
    cells.forEach((cell) => {
        cell.addEventListener('click', () => {
            toColorCell = !toColorCell;
            if (toColorCell) {
                rootEle.style.setProperty('--sketchpad-hover-color', 'var(--sketchpad-hover-color-active)');
            } else {
                rootEle.style.setProperty('--sketchpad-hover-color', 'var(--sketchpad-hover-color-inactive)');
            }
            updateCellColor(cell);
        });
        cell.addEventListener('mouseover', () => updateCellColor(cell));
    })
}

function enableButtons() {
    const colorSelector = document.querySelector('#color-selector');
	colorSelector.value = customHEX;
    colorSelector.addEventListener('input', (e) => refreshColorInput(e));

    const customBtn = document.querySelector('#custom-button');
    customBtn.addEventListener('click', () => setColorMode('custom'));

    const randomBtn = document.querySelector('#random-button');
    randomBtn.addEventListener('click', () => setColorMode('random'));

    const rainbowBtn = document.querySelector('#rainbow-button');
    rainbowBtn.addEventListener('click', () => {
        currentHue = (currentColorMode != 'rainbow') ? 0 : currentHue;
        setColorMode('rainbow');
    })
    const eraserBtn = document.querySelector('#eraser-button');
    eraserBtn.addEventListener('click', () => setColorMode('eraser'));
    
    const darkenToggle = document.querySelector('#darken-toggle');
    darkenToggle.addEventListener('click', () => toggleDarken());

    const resizeBtn = document.querySelector('#resize-button');
    resizeBtn.addEventListener('click', () => resizeSketchpad());
    
    const gridBtn = document.querySelector('#grid-button');
    gridBtn.addEventListener('click', () => {
        toggleGridSketchpad();
        gridBtn.classList.toggle('unpressed');
    });

    const clearBtn = document.querySelector('#clear-button');
    clearBtn.addEventListener('click', () => clearSketchpad());
}

function initializeButtonStates() {
    const gridBtn = document.querySelector('#grid-button');
    if (gridlinesOn) {
        gridBtn.classList.toggle('unpressed');
    }

    let colorBtns = document.querySelectorAll('.color');
    colorBtns.forEach((btn) => {
        if (btn.id == `${currentColorMode}-button`) {
            btn.classList.toggle('unpressed');
        }
    })
}

function displayColorMode(modeStr) {
    switch (modeStr) {
        case 'random':
            displayArea.style.background = gradientStrRandomColors(15, '120deg');
            break;
        case 'rainbow':
            displayArea.style.background = 'linear-gradient(120deg, hsl(0, 70%, 50%), hsl(60, 70%, 50%), hsl(120, 70%, 50%), hsl(180, 70%, 50%), hsl(240, 70%, 50%), hsl(300, 70%, 50%), hsl(360, 70%, 50%))';
            break;
        case 'eraser':
            displayArea.style.background = 'repeating-linear-gradient(120deg, white, white 5%, hsl(0, 80%, 50%) 5%, hsl(0, 80%, 50%) 6%)';
            break;
        case 'custom':
            displayArea.style.background = customHEX;
    }
}

function load(height) {
    currentColorMode = defaultColorMode;
	customHEX = startingPickerColor;
    toDarkenOnRepeat = false;
    toColorCell = false;
    gridlinesOn = true;
    buildSketchpad(height);
    enableInteraction();
    enableButtons();
    initializeButtonStates();
    displayColorMode(currentColorMode);
}

load(16);