const languagesCache = {};
let wordList = [];
let board = [];
const wordListElement = document.getElementById('word-list');
const boardElement = document.querySelector('.board');
const languageSelector = document.getElementById('language');

const correctColor = '#538D4E';
const presentColor = '#B59F3B';
const tileBackgroundColor = '#3A3A3C';
const correctColorRGB = "rgb(83, 141, 78)";
const presentColorRGB = "rgb(181, 159, 59)";
const tileBackgroundColorRGB = "rgb(58, 58, 60)";

const LETTER_REGEX = /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/i;
const MOBILE_REGEX = /Mobi|Android/i;

const getTilePosition = tile => ({
    col: parseInt(tile.getAttribute('data-col')),
    row: parseInt(tile.getAttribute('data-row'))
});

document.querySelector('.container').style.display = 'none';

let debounceTimer;

function updateWordListDebounced() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateWordList, 250);
}

languageSelector.addEventListener('change', (e) => {
    const selectedLanguage = e.target.value;
    if (selectedLanguage) {
        loadLanguage(selectedLanguage);
    }
});

function hasContent(tile) {
    return tile.textContent.trim().length === 1;
}

function getTileState(tile) {
    return {
        letter: tile.textContent.trim().toLowerCase(),
        color: window.getComputedStyle(tile).backgroundColor
    };
}

async function loadLanguage(lang) {
    try {
        if (languagesCache[lang]) {
            wordList = languagesCache[lang];
        } else {
            const response = await fetch(`languages/${lang}.txt`);
            if (!response.ok) throw new Error('Network response was not ok');

            const text = await response.text();
            const words = text.split('\n')
                .map(word => word.trim().toLowerCase())
                .filter(word => word.length === 5);

            languagesCache[lang] = words;
            wordList = words;
        }

        initializeBoard();
        document.querySelector('.container').style.display = 'flex';
        updateWordListDebounced();
    } catch (error) {
        console.error('Error loading word list:', error);
        alert('Error loading word list. Please try again.');
    }
}

function initializeBoard() {
    boardElement.innerHTML = '';
    board = [];
    for (let row = 0; row < 6; row++) {
        board[row] = [];
        for (let col = 0; col < 5; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-row', row);
            tile.setAttribute('data-col', col);
            tile.setAttribute('contenteditable', 'true');
            tile.addEventListener('input', handleInput);
            tile.addEventListener('click', handleClick);
            tile.addEventListener('keydown', handleKeyDown);
            tile.addEventListener('contextmenu', handleRightClick);

            tile.addEventListener('touchstart', handleTouchStart);
            const clearTouchTimer = e => clearTimeout(e.target.longPressTimer);
            tile.addEventListener('touchend', clearTouchTimer);
            tile.addEventListener('touchcancel', clearTouchTimer);
            tile.addEventListener('touchmove', clearTouchTimer);

            board[row][col] = tile;
            boardElement.appendChild(tile);
        }
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    e.target.longPressTimer = setTimeout(() => cycleTileColor(e.target), 500);
}

function handleInput(e) {
    const tile = e.target;
    const text = tile.textContent.trim().toUpperCase();
    tile.textContent = text.charAt(0);
    moveToNextTile(tile);
    updateWordListDebounced();
}

function handleClick(e) {
    const tile = e.target;
    if (e.shiftKey) {
        cycleTileColor(tile);
    } else {
        tile.focus();
    }
}

function handleKeyDown(e) {
    const tile = e.target;
    const key = e.key;

    if (e.key === 'Backspace') {
        if (tile.textContent === '') {
            moveToPreviousTile(tile);
        } else {
            tile.textContent = '';
            e.preventDefault();
        }
    } else if (key.length === 1 && LETTER_REGEX.test(key)) {
        tile.textContent = key.toUpperCase();
        moveToNextTile(tile);
        e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
        moveToPreviousTile(tile);
    } else if (e.key === 'ArrowRight') {
        moveToNextTile(tile);
    }
    updateWordListDebounced();
}

function handleRightClick(e) {
    if (MOBILE_REGEX.test(navigator.userAgent)) {
        e.preventDefault();
        return;
    }
    e.preventDefault();
    cycleTileColor(e.target);
}

const COLOR_CYCLE = {
    [tileBackgroundColorRGB]: presentColor,
    [presentColorRGB]: correctColor,
    [correctColorRGB]: tileBackgroundColor
};

function cycleTileColor(tile) {
    const currentColor = window.getComputedStyle(tile).backgroundColor;
    tile.style.backgroundColor = COLOR_CYCLE[currentColor] || tileBackgroundColor;
    updateWordListDebounced();
}



function moveToNextTile(tile) {
    const {col, row} = getTilePosition(tile);
    const nextTile = col < 4 ? board[row][col + 1] :
        row < 5 ? board[row + 1][0] : null;
    nextTile?.focus();
}

function moveToPreviousTile(tile) {
    const {col, row} = getTilePosition(tile);
    const prevTile = col > 0 ? board[row][col - 1] :
        row > 0 ? board[row - 1][4] : null;
    prevTile?.focus();
}

function clearBoard() {
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            board[row][col].textContent = '';
            board[row][col].style.backgroundColor = tileBackgroundColor;
        }
    }
    updateWordListDebounced();
}

document.getElementById('clear-button').addEventListener('click', clearBoard);

function updateWordList() {
    // Cache board state
    const boardState = board.map(row =>
        row.map(tile => getTileState(tile))
    );

    let results = [...wordList];
    const greenLetters = Array(5).fill('');
    const yellowLettersPerPosition = Array(5).fill().map(() => new Set());
    const exactLetterCounts = new Map();

    for (let row = 0; row < 6; row++) {
        const rowLetterCounts = new Map();
        let hasContent = false;

        // Count letters in the row using cached state
        for (let col = 0; col < 5; col++) {
            const {letter, color} = boardState[row][col];
            if (letter.length !== 1) continue;
            hasContent = true;

            rowLetterCounts.set(letter, (rowLetterCounts.get(letter) || 0) + 1);

            if (color === correctColorRGB) {
                greenLetters[col] = letter;
            } else if (color === presentColorRGB) {
                yellowLettersPerPosition[col].add(letter);
            }
        }

        if (!hasContent) continue;

        // Determine exact counts
        for (const [letter, totalCount] of rowLetterCounts.entries()) {
            let confirmedCount = 0;

            // Count confirmed letters using cached state
            for (let col = 0; col < 5; col++) {
                const {letter: tileLetter, color} = boardState[row][col];
                if (tileLetter !== letter) continue;

                if (color === correctColorRGB || color === presentColorRGB) {
                    confirmedCount++;
                }
            }

            if (confirmedCount < totalCount) {
                exactLetterCounts.set(letter, confirmedCount);
            }
        }
    }

    // Filter words
    results = results.filter(word => {
        // Check green letters
        for (let i = 0; i < 5; i++) {
            if (greenLetters[i] && word[i] !== greenLetters[i]) {
                return false;
            }
        }

        // Check yellow letters
        for (let i = 0; i < 5; i++) {
            if (yellowLettersPerPosition[i].has(word[i])) {
                return false;
            }
            for (const letter of yellowLettersPerPosition[i]) {
                if (!word.includes(letter)) {
                    return false;
                }
            }
        }

        // Check exact counts
        for (const [letter, exactCount] of exactLetterCounts.entries()) {
            const wordCount = (word.match(new RegExp(letter, 'g')) || []).length;
            if (wordCount !== exactCount) {
                return false;
            }
        }

        return true;
    });

    // Update UI efficiently
    const fragment = document.createDocumentFragment();
    results.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word.toUpperCase();
        fragment.appendChild(li);
    });

    wordListElement.replaceChildren(fragment);
}