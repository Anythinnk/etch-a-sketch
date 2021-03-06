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

function resizeSketchpad(height) {
    buildSketchpad(height);
    enableInteraction();
    currentHue = 0;
    if (currentColorMode == 'eraser') {
        setColorMode(defaultColorMode);
    }
}

function clearSketchpad() {
    currentHue = 0;
    let cells = document.querySelectorAll('.sketchpad-cell');
    cells.forEach((cell) => {
        eraseCellColor(cell);
    })
    if (currentColorMode == 'eraser') {
        setColorMode(defaultColorMode);
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
    const themeToggle = document.querySelector('#toggle-theme');
    themeToggle.addEventListener('click', () => toggleDarkMode());

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
    darkenToggle.addEventListener('click', () => {
        toggleDarken();
        darkenToggle.classList.toggle('unpressed');
    });

    const resizeDialog = document.querySelector('#confirm-resize');
    const resizeBtn = document.querySelector('#resize-button');
    const resizeInput = document.querySelector('#resize-input');
    const resizeOkBtn = document.querySelector('#resize-ok-btn');
    const resizeCancelBtn = document.querySelector('#resize-cancel-btn');
    const resizeWrongInputAlert = document.querySelector('#resize-wrong-input');
    const requirementEmphasis = document.querySelector('#req-emphasis');
    resizeBtn.addEventListener('click', () => resizeDialog.showModal());
    resizeOkBtn.addEventListener('click', () => {
        let height = resizeInput.value;
        if (Number.isInteger(Number(height)) && Number(height) >= 16 && Number(height) <= 100) {
            resizeSketchpad(height);
            resizeInput.value = '';
            requirementEmphasis.style.fontWeight = 'normal';
            resizeDialog.close();
        } else if (height != null) {
            resizeInput.value = '';
            requirementEmphasis.style.fontWeight = 'bold';
            resizeWrongInputAlert.showModal();
        }
    })
    resizeInput.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            resizeOkBtn.click();
        }
    })
    resizeCancelBtn.addEventListener('click', () => {
        resizeInput.value = '';
        resizeDialog.close();
    })
    resizeDialog.addEventListener('cancel', () => {
        resizeInput.value = '';
    })

    const gridBtn = document.querySelector('#grid-button');
    gridBtn.addEventListener('click', () => {
        toggleGridSketchpad();
        gridBtn.classList.toggle('unpressed');
    });

    const clearDialog = document.querySelector('#confirm-clear');
    const clearBtn = document.querySelector('#clear-button');
    const clearYesBtn = document.querySelector('#clear-yes-btn');
    clearBtn.addEventListener('click', () => clearDialog.showModal());
    clearYesBtn.addEventListener('click', () => clearSketchpad());
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
            displayArea.style.background = 'repeating-linear-gradient(120deg, var(--sketchpad-background-color) 0% 5%, var(--eraser-display-stripe-color) 5% 6%)';
            break;
        case 'custom':
            displayArea.style.background = customHEX;
    }
}

function toggleDarkMode() {
    const themeLightText = document.querySelector('#theme-light-label');
    const themeDarkText = document.querySelector('#theme-dark-label');
    document.body.classList.toggle('dark-mode');
    themeLightText.classList.toggle('bold-label');
    themeDarkText.classList.toggle('bold-label');

    if (currentColorMode === 'eraser') {
        displayColorMode('eraser');
    }
}

function cycleTips() {
    const tips = [
        'Click on the sketchpad to enable/disable drawing', 
        'The bar above the sketchpad displays your current drawing mode/color',
        'Half of the bar above the sketchpad will be darkened if shading is enabled',
        'If shading is enabled, cells that you hover over repeatedly will darken slowly until black',
        'If shading is disabled, cell colors will be replaced on repeated hovers',
        'Double click a cell when drawing is disabled to color that cell only'];
    const element = document.querySelector('#tip');
    let index = 0;
    let cycle = setInterval(chooseTip, 8000);
    function chooseTip() {
        index = (index == tips.length - 1) ? 0 : index + 1;
        element.textContent = tips[index];
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
    cycleTips();
}

load(16);