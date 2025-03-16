export const COLORS = {
    correct: '#538D4E',
    present: '#B59F3B',
    background: '#3A3A3C',
    correctRGB: "rgb(83, 141, 78)",
    presentRGB: "rgb(181, 159, 59)",
    backgroundRGB: "rgb(58, 58, 60)"
};

export const REGEXES = {
    letter: /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/i,
    mobile: /Mobi|Android/i
};

export const COLOR_CYCLE = {
    [COLORS.backgroundRGB]: COLORS.present,
    [COLORS.presentRGB]: COLORS.correct,
    [COLORS.correctRGB]: COLORS.background
};