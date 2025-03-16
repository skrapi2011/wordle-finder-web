import { Board } from './components/Board.js';
import { WordList } from './components/WordList.js';
import { loadLanguage } from './services/languageService.js';
import { debounce } from './utils/helpers.js';
import { COLORS } from './constants/config.js';

class WordleSolver {
    constructor() {
        this.board = new Board(
            document.querySelector('.board'),
            debounce(() => this.updateWordList(), 250)
        );
        this.wordList = new WordList(document.getElementById('word-list'));
        this.words = [];
        this.initializeEventListeners();
        this.hideContainer();
    }

    initializeEventListeners() {
        document.getElementById('language')
            .addEventListener('change', e => this.handleLanguageChange(e));

        document.getElementById('clear-button')
            .addEventListener('click', () => this.board.clear());
    }

    async handleLanguageChange(e) {
        const selectedLanguage = e.target.value;
        if (!selectedLanguage) return;

        try {
            this.words = await loadLanguage(selectedLanguage);
            this.board.initialize();
            this.showContainer();
            this.updateWordList();
        } catch (error) {
            alert('Error loading word list. Please try again.');
        }
    }

    hideContainer() {
        document.querySelector('.container').style.display = 'none';
    }

    showContainer() {
        document.querySelector('.container').style.display = 'flex';
    }

    updateWordList() {
        const boardState = this.board.getBoardState();
        const results = this.filterWords(boardState);
        this.wordList.update(results);
    }

    filterWords(boardState) {
        let results = [...this.words];
        const greenLetters = Array(5).fill('');
        const yellowLettersPerPosition = Array(5).fill().map(() => new Set());
        const exactLetterCounts = new Map();

        for (let row = 0; row < 6; row++) {
            const rowLetterCounts = new Map();
            let hasContent = false;

            // Count letters in the row
            for (let col = 0; col < 5; col++) {
                const {letter, color} = boardState[row][col];
                if (letter.length !== 1) continue;
                hasContent = true;

                rowLetterCounts.set(letter, (rowLetterCounts.get(letter) || 0) + 1);

                if (color === COLORS.correctRGB) {
                    greenLetters[col] = letter;
                } else if (color === COLORS.presentRGB) {
                    yellowLettersPerPosition[col].add(letter);
                }
            }

            if (!hasContent) continue;

            // Determine exact counts
            for (const [letter, totalCount] of rowLetterCounts.entries()) {
                let confirmedCount = 0;

                for (let col = 0; col < 5; col++) {
                    const {letter: tileLetter, color} = boardState[row][col];
                    if (tileLetter !== letter) continue;

                    if (color === COLORS.correctRGB || color === COLORS.presentRGB) {
                        confirmedCount++;
                    }
                }

                if (confirmedCount < totalCount) {
                    exactLetterCounts.set(letter, confirmedCount);
                }
            }
        }

        // Filter words based on constraints
        return results.filter(word => {
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
    }
}

// Initialize application
const app = new WordleSolver();