import { COLORS, REGEXES, COLOR_CYCLE } from '../constants/config.js';
import { getTilePosition, hasContent, getTileState } from '../utils/helpers.js';

export class Board {
    constructor(element, onUpdate) {
        this.element = element;
        this.board = [];
        this.onUpdate = onUpdate;
    }

    initialize() {
        this.element.innerHTML = '';
        this.board = [];

        for (let row = 0; row < 6; row++) {
            this.board[row] = [];
            for (let col = 0; col < 5; col++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.setAttribute('data-row', row);
                tile.setAttribute('data-col', col);
                tile.setAttribute('contenteditable', 'true');

                this.setupTileEventListeners(tile);

                this.board[row][col] = tile;
                this.element.appendChild(tile);
            }
        }
    }

    setupTileEventListeners(tile) {
        tile.addEventListener('input', e => this.handleInput(e));
        tile.addEventListener('click', e => this.handleClick(e));
        tile.addEventListener('keydown', e => this.handleKeyDown(e));
        tile.addEventListener('contextmenu', e => this.handleRightClick(e));
        tile.addEventListener('touchstart', e => this.handleTouchStart(e));
        tile.addEventListener('touchend', e => this.handleTouchEnd(e));
    }

    handleInput(e) {
        const tile = e.target;
        const text = tile.textContent.trim().toUpperCase();
        tile.textContent = text.charAt(0);
        this.moveToNextTile(tile);
        this.onUpdate();
    }

    handleTouchStart(e) {
        if (REGEXES.mobile.test(navigator.userAgent)) {
            e.target.focus();
        }
    }

    handleTouchEnd(e) {
        if (REGEXES.mobile.test(navigator.userAgent)) {
            const tile = e.target;
            if (!tile.isContentEditable || tile.textContent.trim() !== '') {
                this.cycleTileColor(tile);
                e.preventDefault();
            }
        }
    }

    handleClick(e) {
        const tile = e.target;
        if (!REGEXES.mobile.test(navigator.userAgent)) {
            tile.focus();
        }
    }


    handleKeyDown(e) {
        const tile = e.target;
        const key = e.key;

        if (key === 'Backspace') {
            if (tile.textContent === '') {
                this.moveToPreviousTile(tile);
            } else {
                tile.textContent = '';
                e.preventDefault();
            }
        } else if (key.length === 1 && REGEXES.letter.test(key)) {
            tile.textContent = key.toUpperCase();
            this.moveToNextTile(tile);
            e.preventDefault();
        } else if (key === 'ArrowLeft') {
            this.moveToPreviousTile(tile);
        } else if (key === 'ArrowRight') {
            this.moveToNextTile(tile);
        }
        this.onUpdate();
    }

    handleRightClick(e) {
        e.preventDefault();
        if (!REGEXES.mobile.test(navigator.userAgent)) {
            this.cycleTileColor(e.target);
        }
    }

    moveToNextTile(tile) {
        const {col, row} = getTilePosition(tile);
        const nextTile = col < 4 ? this.board[row][col + 1] :
            row < 5 ? this.board[row + 1][0] : null;
        nextTile?.focus();
    }

    moveToPreviousTile(tile) {
        const {col, row} = getTilePosition(tile);
        const prevTile = col > 0 ? this.board[row][col - 1] :
            row > 0 ? this.board[row - 1][4] : null;
        prevTile?.focus();
    }

    cycleTileColor(tile) {
        const currentColor = window.getComputedStyle(tile).backgroundColor;
        tile.style.backgroundColor = COLOR_CYCLE[currentColor] || COLORS.background;
        this.onUpdate();
    }

    clear() {
        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                this.board[row][col].textContent = '';
                this.board[row][col].style.backgroundColor = COLORS.background;
            }
        }
        this.onUpdate();
    }

    getBoardState() {
        return this.board.map(row =>
            row.map(tile => getTileState(tile))
        );
    }

    getTile(row, col) {
        return this.board[row][col];
    }
}