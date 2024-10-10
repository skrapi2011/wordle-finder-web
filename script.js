let wordList = []; // This will be set after loading the language file
let board = [];
const wordListElement = document.getElementById('word-list');
const boardElement = document.querySelector('.board');
const languageSelector = document.getElementById('language');

const correctColor = '#538D4E';
const presentColor = '#B59F3B';
const tileBackgroundColor = '#3A3A3C';

// Hide the board and word list until a language is selected
document.querySelector('.container').style.display = 'none';

languageSelector.addEventListener('change', (e) => {
    const selectedLanguage = e.target.value;
    if (selectedLanguage) {
        loadLanguage(selectedLanguage);
    }
});

function loadLanguage(lang) {
    fetch(`languages/${lang}.txt`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(text => {
            wordList = text.split('\n').map(word => word.trim().toLowerCase()).filter(word => word.length === 5);
            initializeBoard();
            document.querySelector('.container').style.display = 'flex';
            updateWordList();
        })
        .catch(error => {
            console.error('Error loading word list:', error);
            alert('Error loading word list. Please try again.');
        });
}

function initializeBoard() {
    // Clear previous board if any
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

            // Event listeners
            tile.addEventListener('input', handleInput);
            tile.addEventListener('click', handleClick);
            tile.addEventListener('keydown', handleKeyDown);

            // Right-click event listener
            tile.addEventListener('contextmenu', handleRightClick);

            board[row][col] = tile;
            boardElement.appendChild(tile);
        }
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
        cycleTileColor(tile); // Cycle through colors when Shift+Click
    } else {
        tile.focus(); // Focus the tile on normal click
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
    e.preventDefault(); // Prevent the default right-click menu
    const tile = e.target;
    cycleTileColor(tile);
}

function cycleTileColor(tile) {
    const currentColor = tile.style.backgroundColor || tileBackgroundColor;

    // Cycle through the colors: default → yellow → green → default
    if (currentColor === tileBackgroundColor) {
        tile.style.backgroundColor = presentColor; // Change to yellow
    } else if (currentColor === presentColor) {
        tile.style.backgroundColor = correctColor; // Change to green
    } else {
        tile.style.backgroundColor = tileBackgroundColor; // Change back to default
    }
    updateWordList(); // Update the word list based on new colors
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

function updateWordList() {
    const greens = {};
    const yellows = {};
    const grays = new Set();
    const minCounts = {};
    const maxCounts = {};

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
            const tile = board[row][col];
            const text = tile.textContent.trim().toLowerCase();
            if (text.length === 1) {
                const c = text;
                const bgColor = tile.style.backgroundColor || tileBackgroundColor;
                if (bgColor === correctColor) {
                    greens[col] = c;
                    minCounts[c] = (minCounts[c] || 0) + 1;
                } else if (bgColor === presentColor) {
                    yellows[col] = yellows[col] || [];
                    yellows[col].push(c);
                    minCounts[c] = (minCounts[c] || 0) + 1;
                } else if (bgColor === tileBackgroundColor) {
                    grays.add(c);
                }
            }
        }
    }

    // Set max counts for gray letters
    grays.forEach(c => {
        const maxCount = minCounts[c] || 0;
        maxCounts[c] = maxCount;
    });

    // Remove green and yellow letters from gray letters
    Object.values(greens).forEach(c => grays.delete(c));
    Object.values(yellows).flat().forEach(c => grays.delete(c));

    const filteredWords = wordList.filter(word => {
        return isValidWord(word, greens, yellows, grays, minCounts, maxCounts);
    });

    // Update the word list display
    wordListElement.innerHTML = '';
    filteredWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word.toUpperCase();
        wordListElement.appendChild(li);
    });
}

function isValidWord(word, greens, yellows, grays, minCounts, maxCounts) {
    const wordCounts = {};
    const letters = word.split('');

    // Check green letters and build wordCounts
    for (let i = 0; i < letters.length; i++) {
        const c = letters[i];
        wordCounts[c] = (wordCounts[c] || 0) + 1;

        if (greens[i]) {
            if (greens[i] !== c) {
                return false;
            }
        }
    }

    // Check yellow letters
    for (const [pos, chars] of Object.entries(yellows)) {
        const index = parseInt(pos);
        for (const c of chars) {
            if (letters[index] === c || !word.includes(c)) {
                return false;
            }
        }
    }

    // Check gray letters
    for (const c of grays) {
        const countInWord = wordCounts[c] || 0;
        const maxCount = maxCounts[c] || 0;
        if (countInWord > maxCount) {
            return false;
        }
    }

    // Check minimum counts
    for (const [c, minCount] of Object.entries(minCounts)) {
        if ((wordCounts[c] || 0) < minCount) {
            return false;
        }
    }

    return true;
}
