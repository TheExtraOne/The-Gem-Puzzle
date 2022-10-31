'use strict'

let field9 = [1,2,3,4,5,6,7,8,0];
let field16 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
let field25 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,0];
let field36 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,0];
let field49 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,0];
let field64 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,0];
let didTimerStart = false;
let isWin = false;
let chossenField;
const storedChossenField = JSON.parse(localStorage.getItem('storedChossenField'));
if ( storedChossenField ) {
    chossenField = storedChossenField;
} else {
    chossenField = field16;
}
let rowNum;
const storedRowNum = JSON.parse(localStorage.getItem('storedRowNum'));
if ( storedRowNum ) {
    rowNum = storedRowNum;
} else {
    rowNum = 4;
}

let wrapper = document.createElement('div');
wrapper.classList.add('wrapper');
document.querySelector('body').prepend(wrapper);

//музыка
let isMusicLounch = false;
let sideEffectsVolume = 0.4;
let soundClick = 1;
const moneyAudio = new Audio();
moneyAudio.volume = sideEffectsVolume;
moneyAudio.src = "sounds/money.mp3";

function lounchMusic(){
    clickSoundInit(moneyAudio);
}

function clickSoundInit(audio) {
    audio.play(); // запускаем звук
    audio.pause(); // и сразу останавливаем
}

function clickSound(audio) {
    audio.currentTime = 0; // в секундах
    audio.play();
}

//строю элементы интерфейса
//кнопки
let buttonsContainer = document.createElement('div');
buttonsContainer.classList.add('buttonsContainer');
wrapper.append(buttonsContainer);

function buildButton(innerText, container, buttonClass){
    let button = document.createElement('button');
    button.classList.add(buttonClass);
    button.textContent = innerText;
    container.append(button);
}
buildButton('Shuffle and start',buttonsContainer, 'restart');
document.querySelector('.restart').addEventListener('click', restart);
buildButton('On/off sound',buttonsContainer, 'stop');
document.querySelector('.stop').addEventListener('click', () => {
    soundClick++;
    if (soundClick % 2 === 0) {
        moneyAudio.volume = 0;
    } else {
        moneyAudio.volume = sideEffectsVolume;
    }
});
buildButton('Save',buttonsContainer, 'save');
document.querySelector('.save').addEventListener('click', store);
buildButton('Results',buttonsContainer, 'results');
document.querySelector('.results').addEventListener('click', showScore);

//счетчики
let countersContainer = document.createElement('div');
countersContainer.classList.add('countersContainer');
wrapper.append(countersContainer);

let moveCounter;
const storedMoveCounter = JSON.parse(localStorage.getItem('storedMoveCounter'));
if ( storedMoveCounter ) {
    moveCounter = storedMoveCounter;
} else {
    moveCounter = 0;
}
let moveDiv= document.createElement('div');
moveDiv.classList.add('moveCounter');
moveDiv.textContent = `Moves: ${moveCounter}`;
countersContainer.append(moveDiv);

let timeDiv= document.createElement('div');
timeDiv.classList.add('timeDiv');
countersContainer.append(timeDiv);
let seconds;
let minutes;
const storedSeconds = JSON.parse(localStorage.getItem('storedSeconds'));
if ( storedSeconds ) {
    seconds = storedSeconds;
} else {
    seconds = 0;
}
const storedMinutes = JSON.parse (localStorage.getItem('storedMinutes'));
if ( storedMinutes ) {
    minutes = storedMinutes;
} else {
    minutes = 0;
}
timeDiv.textContent = `Time: ${minutes} : ${seconds}`;

if (!didTimerStart) {
    didTimerStart = true;
    setTimeout(tick, 1000);
}

function tick() {
    seconds++;
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    timeDiv.textContent = `Time: ${minutes} : ${seconds}`;
    if (!isWin) {
        setTimeout(tick, 1000);
    } 
}

//игровое поле
let gameContainer = document.createElement('div');
gameContainer.classList.add('gameContainer');
wrapper.append(gameContainer);
gameContainer.addEventListener('click', debounceSerie(moveCell,300,true));
gameContainer.addEventListener('dragstart', dragAndDrop);

function debounceSerie(func,interval,immediate) {
    let timer;
    return function() {
        let context=this, args=arguments;
        let later=function() {
            timer=null;
            if ( !immediate )
                func.apply(context,args);
        };
        let callNow=immediate&&!timer;
        clearTimeout(timer);
        timer=setTimeout(later,interval);
        if ( callNow )
            func.apply(context,args);
    };
}

function cloneArr(arr) {
    return arr.slice(0);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let currentField;
const storedCurrentField = JSON.parse(localStorage.getItem('storedCurrentField'));
if ( storedCurrentField ) {
    currentField = storedCurrentField;
} else {
    currentField = shuffle(cloneArr(chossenField));
}

function checkedSolvable(arr) {
    let ckeckedArr = cloneArr(arr);
    let perfectArr = [];
    let start = 1;
    for (let i = 0; i < currentField.length; i++) {
        perfectArr.push(start);
        start++;
    }

    let inversion = 0;
    for (let i = 0; i < ckeckedArr.length; i++) {
        if (ckeckedArr[i] !== perfectArr[i]) {
            inversion++;
            let foundIndex = ckeckedArr.indexOf(perfectArr[i]);
            let buff = 0;
            buff = ckeckedArr[i];
            ckeckedArr[i] = ckeckedArr[foundIndex];
            ckeckedArr[foundIndex] = buff;
            
        }
    }
    return inversion;
}

function makeSolveable(someArr) {
    let newArr = cloneArr(someArr);
    let result;
    //если поле 3х3, 5х5, 7х7, то кол-во инверсий для решения должно быть ЧЕТНЫМ
    if (rowNum % 2 !== 0) {
        newArr = newArr.filter(item => item > 0);
        result = checkedSolvable(newArr);
        while( result % 2 !== 0) {
            someArr = shuffle(someArr);
            newArr = cloneArr(someArr);
            newArr = newArr.filter(item => item > 0);
            result = checkedSolvable(newArr);
        }
    }
    //если поле 4х4, 8х8, то кол-во инверсий для решения + индекс ряда, в котором пустая клетка должны быть НЕЧЕТНЫМ
    else {
        let emptyCellRowNum;
        let matrix = buildMatrixField(newArr);
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === 0) {
                    emptyCellRowNum = i;
                    break;
                }
            }
        }

        result = checkedSolvable(newArr) + emptyCellRowNum;
        while( result % 2 === 0) {
            someArr = shuffle(someArr);
            newArr = cloneArr(someArr);
            newArr = newArr.filter(item => item > 0);
            result = checkedSolvable(newArr) + emptyCellRowNum;
        }
        console.log(result);
    }
}
makeSolveable(currentField);
//строю поле
function buildField(arr, row, container) {
    let j = 0;
    for (let i = 0; i < arr.length; i++) {
        j++;
        let cell = document.createElement('div');
        if (arr[i]) {
            cell.classList.add('gameCell');
            cell.innerHTML = `<p>${arr[i]}</p>`;
            cell.setAttribute('draggable', true);
        } else {
            cell.classList.add('emptyCell');
        }
        container.append(cell);
        if (j === row) {
            container.append(document.createElement('br'));
            j = 0;
        }
    }
    container.style.width = document.querySelector('.gameCell').offsetWidth * row + 'px';
    container.style.height = document.querySelector('.gameCell').offsetHeight * row + 'px';
}

buildField(currentField, rowNum, gameContainer);

function makeSellsAbsolute() {
    //запоминаю позиции всех клеток
    let cellArr = gameContainer.querySelectorAll('div');
    let cellCoord = [];
    let i = 0;

    for (let cell of cellArr) {
        cellCoord.push(cell.offsetLeft, cell.offsetTop);
    }
    //позиционирую все клетки
    for (let cell of cellArr) {
        cell.style.position = 'absolute';
        cell.style.top = cellCoord[i + 1] + 'px';
        cell.style.left = cellCoord[i] + 'px';
        i = i + 2;
    }
}

makeSellsAbsolute();

let sizeWrapper = document.createElement('div');
sizeWrapper.classList.add('sizeWrapper');
wrapper.append(sizeWrapper);
//выбранный размер
let currentFrameSize = '4 x 4';
let currentSize = document.createElement('div');
currentSize.classList.add('currentSize');
currentSize.textContent = `Frame size: ${currentFrameSize}`;
sizeWrapper.append(currentSize);

//другие размеры
let sizeContainer = document.createElement('div');
sizeContainer.classList.add('sizeContainer');
sizeWrapper.append(sizeContainer);
sizeContainer.addEventListener('click', changeSize);

function changeSize(event) {
    if(!(event.target.classList.contains('spanNumber'))) {
        return;
    }

    currentFrameSize = event.target.innerHTML;
    currentSize.textContent = `Frame size: ${currentFrameSize}`;
    rowNum = +(event.target.innerHTML.slice(0,1));
    if (rowNum === 3) {
        chossenField = field9;
    } else if (rowNum === 4) {
        chossenField = field16;
    } else if (rowNum === 5) {
        chossenField = field25;
    } else if (rowNum === 6) {
        chossenField = field36;
    } else if (rowNum === 7) {
        chossenField = field49;
    } else if (rowNum === 8) {
        chossenField = field64;
    }
    restart();
}

function createSpan(innerText, container, spanClass = false) {
    let span = document.createElement('span');
    if (spanClass) {
        span.classList.add(spanClass);
    }
    span.textContent = innerText;
    container.append(span);
}

createSpan('Other sizes:', sizeContainer);
createSpan('3 x 3', sizeContainer, 'spanNumber');
createSpan('4 x 4', sizeContainer, 'spanNumber');
createSpan('5 x 5', sizeContainer, 'spanNumber');
createSpan('6 x 6', sizeContainer, 'spanNumber');
createSpan('7 x 7', sizeContainer, 'spanNumber');
createSpan('8 x 8', sizeContainer, 'spanNumber');

//перевожу одномерный массив в матрицу
function buildMatrixField(arr) {
    let matrixArr = [];
    for (let i = 0; i < arr.length; i = i + rowNum) {
        matrixArr.push(arr.slice(i, rowNum + i));
    }
    return matrixArr;
}

let matrixField = buildMatrixField(currentField);

//отслеживаю клики и перемещаю клетки
function moveCell(event) {
    let cell = event.target.closest('div');
    let emptyCell = document.querySelector('.emptyCell');
    if (!cell) {
        return;
    }
    let cellValue = parseInt(cell.innerHTML.slice(3));
    if (isEmptyNear(matrixField, cellValue) ) {
        if (!isMusicLounch) {
            lounchMusic();
            isMusicLounch = true;
        }
        clickSound(moneyAudio);
        moveCounter++;
        moveDiv.textContent = `Moves: ${moveCounter}`;
        movePlate(cell,emptyCell,matrixField,cellValue);
        winCheck(matrixField, rowNum);
    }
}

function movePlate(cell,emptyCell,matrixField,cellValue) {
    let prevTop = cell.offsetTop;
    let prevLeft = cell.offsetLeft;

    cell.style.zIndex = '100';
    cell.style.top = emptyCell.offsetTop + 'px';
    cell.style.left = emptyCell.offsetLeft + 'px';
    setTimeout(() => {cell.style.zIndex = '1'}, 400);

    emptyCell.style.top = prevTop + 'px';
    emptyCell.style.left = prevLeft + 'px';

    let empty = 'empty';
    for (let i = 0; i < matrixField.length; i++) {
        for (let j = 0; j < matrixField[i].length; j++) {
            if (matrixField[i][j] === cellValue) {
                matrixField[i][j] = empty;
            }
            if (matrixField[i][j] === 0) {
                matrixField[i][j] = cellValue;
            }
        }
    }
    for (let i = 0; i < matrixField.length; i++) {
        for (let j = 0; j < matrixField[i].length; j++) {
            if (matrixField[i][j] === empty) {
                matrixField[i][j] = 0;
            }
        }
    }
}

function winCheck(matrixField, rowNum) {
    let keyArr;
    if (rowNum === 3) {
        keyArr = field9;
    } else if (rowNum === 4) {
        keyArr = field16;
    } else if (rowNum === 5) {
        keyArr = field25;
    } else if (rowNum === 6) {
        keyArr = field36;
    } else if (rowNum === 7) {
        keyArr = field49;
    } else if (rowNum === 8) {
        keyArr = field64;
    }
    if (JSON.stringify( buildArrayField(matrixField) ) === JSON.stringify(keyArr)) {
        //остановить таймер
        isWin = true;
        didTimerStart = false;
        //вывести поздравление
        showPopup(`Hooray! You solved the puzzle in ${minutes}:${seconds} and ${moveCounter} moves!`, 300);
        //закинуть в локал по мувам
        let currentScore = [];
        currentScore.push(moveCounter);
        let storedScore = JSON.parse(localStorage.getItem('storedScore'));
        if ( storedScore ) {
            storedScore.push(moveCounter);
            storedScore.sort((a,b) => a - b);
            if (storedScore.length > 10) {
                storedScore = storedScore.slice(0,10);
            }
            localStorage.setItem('storedScore', JSON.stringify(storedScore));
        } else {
            localStorage.setItem('storedScore', JSON.stringify([currentScore]));
        }
    }
}
function dragAndDrop(event) {
    let cell = event.target.closest('div');
    if (!cell) {
        return;
    }

    let cellValue = parseInt(cell.innerHTML.slice(3));
    if (!isEmptyNear(matrixField, cellValue)) {
        event.preventDefault();
        return;
    }
    let emptyCell = document.querySelector('.emptyCell');
    emptyCell.addEventListener('drop', putElement);
    emptyCell.addEventListener('dragover', (event) => {event.preventDefault(); emptyCell.style.backgroundColor = '#469e9e';}, false);
    emptyCell.addEventListener('dragleave', () => {emptyCell.style.backgroundColor = '';}, false);

    function putElement(event) {
        event.preventDefault();
        emptyCell.style.backgroundColor = '';
        if (!isMusicLounch) {
            lounchMusic();
            isMusicLounch = true;
        }
        clickSound(moneyAudio);
        moveCounter++;
        moveDiv.textContent = `Moves: ${moveCounter}`;
        movePlate(cell,emptyCell,matrixField,cellValue);
        winCheck(matrixField, rowNum);
        emptyCell.removeEventListener('drop', putElement);
        emptyCell.removeEventListener('dragover', (event) => {event.preventDefault(); emptyCell.style.backgroundColor = '#469e9e';}, false);
        emptyCell.removeEventListener('dragleave', () => {emptyCell.style.backgroundColor = '';}, false);
    }
}

function isEmptyNear(matrix, value) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] === value) {
                //если верхний ряд {
                if (i === 0) {
                    //если крайнее левое
                    if (j === 0) {
                        if (matrix[i][j+1] === 0 || matrix[i+1][j] === 0) {
                            return true;
                        }
                    }
                    //если крайне правое
                    if (j === matrix[i].length - 1) {
                        if (matrix[i+1][j] === 0 || matrix[i][j-1] === 0) {
                            return true;
                        }
                    }
                    //если в центре
                    if (matrix[i][j+1] === 0 || matrix[i+1][j] === 0 || matrix[i][j-1] === 0) {
                        return true;
                    }
                }
                //если нижний ряд
                else if (i === matrix.length - 1) {
                    //если крайнее левое
                    if (j === 0) {
                        if (matrix[i][j+1] === 0 || matrix[i-1][j] === 0) {
                            return true;
                        }
                    }
                    //если крайне правое
                    if (j === matrix[i].length - 1) {
                        if (matrix[i-1][j] === 0 || matrix[i][j-1] === 0) {
                            return true;
                        }
                    }
                    //если в центре
                    if (matrix[i][j+1] === 0 || matrix[i-1][j] === 0 || matrix[i][j-1] === 0) {
                        return true;
                    }
                }
                //если все соседи есть
                else {
                    if (matrix[i-1][j] === 0 || matrix[i][j+1] === 0 || matrix[i+1][j] === 0 || matrix[i][j-1] === 0) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function restart() {
    //обнуляю счетчики
    moveCounter = 0;
    moveDiv.textContent = `Moves: ${moveCounter}`;
    seconds = 0;
    minutes = 0;
    timeDiv.textContent = `Time: ${minutes} : ${seconds}`;

    isWin = false;

    //очищаю и переделываю поле
    gameContainer.innerHTML = '';
    currentField = shuffle(cloneArr(chossenField));
    makeSolveable(currentField);
    buildField(currentField, rowNum, gameContainer);
    makeSellsAbsolute();
    matrixField = buildMatrixField(currentField);
}

function store() {
    localStorage.setItem('storedRowNum', JSON.stringify(rowNum));
    localStorage.setItem('storedCurrentField', JSON.stringify(buildArrayField(matrixField)));
    localStorage.setItem('storedMoveCounter', JSON.stringify(moveCounter));
    localStorage.setItem('storedSeconds', JSON.stringify(seconds));
    localStorage.setItem('storedMinutes', JSON.stringify(minutes));
    localStorage.setItem('storedChossenField', JSON.stringify(chossenField));
}

//перевожу матрицу в одномерный массив
function buildArrayField(matrix) {
    let arr = [];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            arr.push(matrix[i][j]);
        }
    }
    return arr;
}

function showPopup(text, someHeight) {
    let congrPopContainer = document.createElement('div');
    congrPopContainer.classList.add('congrPopContainer');
    congrPopContainer.addEventListener('click', close);
    wrapper.append(congrPopContainer);

    let congrPopContent = document.createElement('div');
    congrPopContent.classList.add('congrPopContent');
    congrPopContent.innerHTML = text;
    congrPopContent.style.height = someHeight + 'px';
    congrPopContainer.append(congrPopContent);

    let congrPopCross = document.createElement('div');
    congrPopCross.classList.add('congrPopCross');
    congrPopCross.textContent = 'X';
    congrPopCross.addEventListener('click', close);
    congrPopContent.append(congrPopCross);
}

function close() {
    document.querySelector('.congrPopContainer').removeEventListener('click', close);
    document.querySelector('.congrPopCross').removeEventListener('click', close);
    document.querySelector('.congrPopContainer').remove();
    restart();
    if (!didTimerStart) {
        didTimerStart = true;
        setTimeout(tick, 1000);
    }
}

function showScore() {
    let storedScoreArr = JSON.parse(localStorage.getItem('storedScore'));
    if (!storedScoreArr) {
        showPopup('Sorry, it\'s empty');
        return;
    }
    let scoreList = 'Best score: <br/><ol>';
    for (let i = 0; i < storedScoreArr.length; i++) {
        scoreList += `<li>${storedScoreArr[i]}</li>`;
    }
    scoreList += '</ol>';
    showPopup(scoreList, 450);
}
