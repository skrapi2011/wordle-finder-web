const languagesCache = {};

export async function loadLanguage(lang) {
    try {
        if (languagesCache[lang]) {
            return languagesCache[lang];
        }

        const response = await fetch(`languages/${lang}.txt`);
        if (!response.ok) throw new Error('Network response was not ok');

        const text = await response.text();
        const words = text.split('\n')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length === 5);

        languagesCache[lang] = words;
        return words;
    } catch (error) {
        console.error('Error loading word list:', error);
        throw error;
    }
}