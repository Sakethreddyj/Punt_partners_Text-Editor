document.addEventListener('DOMContentLoaded', () => {
    const fontFamilySelect = document.getElementById('font-family');
    const fontWeightSelect = document.getElementById('font-weight');
    const italicToggle = document.getElementById('italic');
    const textEditor = document.getElementById('text-editor');
    const saveButton = document.getElementById('save');
    const resetButton = document.getElementById('reset');

    let fontsData = {};

    // Load font data from JSON
    fetch('fonts.json')
        .then(response => response.json())
        .then(data => {
            fontsData = data;
            populateFontFamilies();
            loadSavedSettings();
        })
        .catch(error => console.error('Error loading fonts:', error));

    function populateFontFamilies() {
        const fonts = Object.keys(fontsData);
        fonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            fontFamilySelect.appendChild(option);
        });

        fontFamilySelect.addEventListener('change', () => {
            const selectedFont = fontFamilySelect.value;
            updateFontWeights(fontsData[selectedFont] || {});
        });

        // Set initial font family and weight
        fontFamilySelect.value = 'Abel'; // Default font
        updateFontWeights(fontsData['Abel'] || {});
    }

    function updateFontWeights(fontVariants) {
        while (fontWeightSelect.firstChild) {
            fontWeightSelect.removeChild(fontWeightSelect.firstChild);
        }

        Object.keys(fontVariants).forEach(weight => {
            const option = document.createElement('option');
            option.value = weight;
            option.textContent = weight;
            fontWeightSelect.appendChild(option);
        });

        // Set initial weight and italic state
        fontWeightSelect.value = '400'; // Default weight
        italicToggle.checked = false; // Default italic
    }

    function loadSavedSettings() {
        const savedText = localStorage.getItem('text');
        const savedFontFamily = localStorage.getItem('fontFamily');
        const savedFontWeight = localStorage.getItem('fontWeight');
        const savedItalic = localStorage.getItem('italic');

        if (savedText) textEditor.value = savedText;
        if (savedFontFamily) {
            fontFamilySelect.value = savedFontFamily;
            updateFontWeights(fontsData[savedFontFamily] || {});
        }
        if (savedFontWeight) fontWeightSelect.value = savedFontWeight;
        if (savedItalic) italicToggle.checked = JSON.parse(savedItalic);

        applySettings();
    }

    function applySettings() {
        const fontFamily = fontFamilySelect.value;
        const fontWeight = fontWeightSelect.value;
        const isItalic = italicToggle.checked;
        const fontVariants = fontsData[fontFamily] || {};
        const fontUrl = fontVariants[fontWeight] || '';

        if (fontUrl) {
            const existingStyle = document.querySelector(`style[data-font-family="${fontFamily}"]`);
            if (existingStyle) {
                existingStyle.remove();
            }
            const style = document.createElement('style');
            style.textContent = `
                @font-face {
                    font-family: '${fontFamily}';
                    src: url('${fontUrl}');
                }
            `;
            style.setAttribute('data-font-family', fontFamily);
            document.head.appendChild(style);
        }

        textEditor.style.fontFamily = fontFamily;
        textEditor.style.fontWeight = fontWeight.replace('italic', '') || '400';
        textEditor.style.fontStyle = isItalic ? 'italic' : 'normal';
    }

    function saveSettings() {
        localStorage.setItem('text', textEditor.value);
        localStorage.setItem('fontFamily', fontFamilySelect.value);
        localStorage.setItem('fontWeight', fontWeightSelect.value);
        localStorage.setItem('italic', JSON.stringify(italicToggle.checked));
    }

    function resetSettings() {
        localStorage.removeItem('text');
        localStorage.removeItem('fontFamily');
        localStorage.removeItem('fontWeight');
        localStorage.removeItem('italic');
        textEditor.value = '';
        fontFamilySelect.value = 'Abel'; // Default font
        fontWeightSelect.value = '400'; // Default weight
        italicToggle.checked = false; // Default italic
        updateFontWeights(fontsData['Abel'] || {});
        applySettings();
    }

    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);

    fontFamilySelect.addEventListener('change', () => {
        const selectedFont = fontFamilySelect.value;
        updateFontWeights(fontsData[selectedFont] || {});
        applySettings();
    });

    fontWeightSelect.addEventListener('change', applySettings);
    italicToggle.addEventListener('change', applySettings);
});
