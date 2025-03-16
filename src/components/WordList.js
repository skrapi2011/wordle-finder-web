export class WordList {
    constructor(element) {
        this.element = element;
    }

    update(words) {
        const fragment = document.createDocumentFragment();
        words.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word.toUpperCase();
            fragment.appendChild(li);
        });
        this.element.replaceChildren(fragment);
    }
}