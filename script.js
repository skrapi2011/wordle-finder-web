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

document.querySelector('.container').style.display = 'none';

languageSelector.addEventListener('change', (e) => {
    const selectedLanguage = e.target.value;
    if (selectedLanguage) {
        loadLanguage(selectedLanguage);
    }
});

function loadLanguage(lang) {
    if (languagesCache[lang]) {
        wordList = languagesCache[lang];
        initializeBoard();
        document.querySelector('.container').style.display = 'flex';
        updateWordList();
    } else {
        fetch(`languages/${lang}.txt`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.text();
            })
            .then(text => {
                const words = text.split('\n')
                    .map(word => word.trim().toLowerCase())
                    .filter(word => word.length === 5);
                languagesCache[lang] = words;
                wordList = words;
                initializeBoard();
                document.querySelector('.container').style.display = 'flex';
                updateWordList();
            })
            .catch(error => {
                console.error('Error loading word list:', error);
                alert('Error loading word list. Please try again.');
            });
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
            tile.addEventListener('touchend', handleTouchEnd);
            tile.addEventListener('touchcancel', handleTouchCancel);
            tile.addEventListener('touchmove', handleTouchMove);

            board[row][col] = tile;
            boardElement.appendChild(tile);
        }
    }
}

function handleTouchStart(e) {
    const tile = e.target;
    tile.longPressTimer = setTimeout(() => {
        cycleTileColor(tile);
    }, 500);
}

function handleTouchEnd(e) {
    const tile = e.target;
    if (tile.longPressTimer) {
        clearTimeout(tile.longPressTimer);
        tile.longPressTimer = null;
    }
}

function handleTouchCancel(e) {
    const tile = e.target;
    if (tile.longPressTimer) {
        clearTimeout(tile.longPressTimer);
        tile.longPressTimer = null;
    }
}

function handleTouchMove(e) {
    const tile = e.target;
    if (tile.longPressTimer) {
        clearTimeout(tile.longPressTimer);
        tile.longPressTimer = null;
    }
}


function handleInput(e) {
    const tile = e.target;
    const text = tile.textContent.trim().toUpperCase();
    tile.textContent = text.charAt(0);
    moveToNextTile(tile);
    updateWordList();
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
    const isLetter = key.length === 1 && key.match(/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/i);
    if (e.key === 'Backspace') {
        if (tile.textContent === '') {
            moveToPreviousTile(tile);
        } else {
            tile.textContent = '';
            e.preventDefault();
        }
    } else if (isLetter) {
        tile.textContent = key.toUpperCase();
        moveToNextTile(tile);
        e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
        moveToPreviousTile(tile);
    } else if (e.key === 'ArrowRight') {
        moveToNextTile(tile);
    }
    updateWordList();
}

function handleRightClick(e) {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        e.preventDefault();
        return;
    }
    e.preventDefault();
    const tile = e.target;
    cycleTileColor(tile);
}

function cycleTileColor(tile) {
    const computedColor = window.getComputedStyle(tile).backgroundColor;
    if (computedColor === tileBackgroundColorRGB) {
        tile.style.backgroundColor = presentColor;
    } else if (computedColor === presentColorRGB) {
        tile.style.backgroundColor = correctColor;
    } else {
        tile.style.backgroundColor = tileBackgroundColor;
    }
    updateWordList();
}

function moveToNextTile(tile) {
    const col = parseInt(tile.getAttribute('data-col'));
    const row = parseInt(tile.getAttribute('data-row'));
    if (col < 4) {
        board[row][col + 1].focus();
    } else if (row < 5) {
        board[row + 1][0].focus();
    }
}

function moveToPreviousTile(tile) {
    const col = parseInt(tile.getAttribute('data-col'));
    const row = parseInt(tile.getAttribute('data-row'));
    if (col > 0) {
        board[row][col - 1].focus();
    } else if (row > 0) {
        board[row - 1][4].focus();
    }
}

function clearBoard() {
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            board[row][col].textContent = '';
            board[row][col].style.backgroundColor = tileBackgroundColor;
        }
    }
    updateWordList();
}

document.getElementById('clear-button').addEventListener('click', clearBoard);

function isLetter(c) {
    return /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]$/.test(c);
}

function findGreenLetters(listToFind, regexArray) {
    let result = [];
    listToFind.forEach(word => {
        let matchedCount = 0;
        let totalRequired = 0;
        for (let i = 0; i < regexArray.length; i++) {
            const c = regexArray[i];
            if (isLetter(c)) {
                totalRequired++;
                if (word[i] === c) {
                    matchedCount++;
                }
            }
        }
        if (matchedCount === totalRequired) {
            result.push(word);
        }
    });
    return result;
}

function findYellow(listToFind, regex) {
    let tempList = [];
    const lettersOnly = regex.replace(/_/g, '');
    const requiredCount = lettersOnly.length;
    const regexArray = regex.split('');
    listToFind.forEach(word => {
        let found = 0;
        for (let i = 0; i < regexArray.length; i++) {
            const c = regexArray[i];
            if (c !== '_') {
                if (word.includes(c) && word[i] !== c) {
                    found++;
                }
            }
        }
        if (found === requiredCount) {
            tempList.push(word);
        }
    });
    return tempList.length === 0 ? listToFind : tempList;
}

function countOccurrences(word, letter) {
    let count = 0;
    for (const c of word) {
        if (c === letter) {
            count++;
        }
    }
    return count;
}

function findGray(listToFind, grayRegex, nonGray) {
    let tempList = [];
    const requiredCounts = {};
    for (const c of nonGray) {
        requiredCounts[c] = (requiredCounts[c] || 0) + 1;
    }
    const lettersToCheck = new Set((nonGray + grayRegex).split(''));
    listToFind.forEach(word => {
        let valid = true;
        for (const letter of lettersToCheck) {
            const countInWord = countOccurrences(word, letter);
            const required = requiredCounts[letter] || 0;
            if (countInWord !== required) {
                valid = false;
                break;
            }
        }
        if (valid) {
            tempList.push(word);
        }
    });
    return tempList.length === 0 ? listToFind : tempList;
}

function updateWordList() {
    let results = [...wordList];
    for (let row = 0; row < 6; row++) {
        let anyFilled = false;
        for (let col = 0; col < 5; col++) {
            if (board[row][col].textContent.trim() !== '') {
                anyFilled = true;
                break;
            }
        }
        if (!anyFilled) {
            continue;
        }
        let greenPattern = "_____".split('');
        let yellowPattern = "_____".split('');
        let grayString = "";
        for (let col = 0; col < 5; col++) {
            const tile = board[row][col];
            const text = tile.textContent.trim().toLowerCase();
            if (text.length === 1) {
                const c = text;
                const bgColor = window.getComputedStyle(tile).backgroundColor;
                if (bgColor === correctColorRGB) {
                    greenPattern[col] = c;
                } else if (bgColor === presentColorRGB) {
                    yellowPattern[col] = c;
                } else {
                    grayString += c;
                }
            }
        }
        results = findGreenLetters(results, greenPattern);
        results = findYellow(results, yellowPattern.join(''));
        const nonGray = (greenPattern.join('') + yellowPattern.join('')).replace(/_/g, '');
        results = findGray(results, grayString, nonGray);
    }
    wordListElement.innerHTML = '';
    results.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word.toUpperCase();
        wordListElement.appendChild(li);
    });
}
