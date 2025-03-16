export const getTilePosition = tile => ({
    col: parseInt(tile.getAttribute('data-col')),
    row: parseInt(tile.getAttribute('data-row'))
});

export const hasContent = tile => tile.textContent.trim().length === 1;

export const getTileState = tile => ({
    letter: tile.textContent.trim().toLowerCase(),
    color: window.getComputedStyle(tile).backgroundColor
});

export const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};