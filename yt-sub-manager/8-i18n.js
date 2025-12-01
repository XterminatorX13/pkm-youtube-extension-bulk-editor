// 8-i18n.js - Internationalization Wrapper
; (() => {
    // Wrapper for chrome.i18n.getMessage to support named parameters like {count}
    function t(key, params = {}) {
        let text = chrome.i18n.getMessage(key) || key

        // Replace params {key}
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`{${param}}`, 'g'), params[param])
        })

        return text
    }

    // Export to global
    window.YTSubI18n = {
        t,
        // Helper to get current locale if needed, though chrome.i18n handles it
        getUILanguage: () => chrome.i18n.getUILanguage()
    }
})()
