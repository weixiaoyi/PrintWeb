const {app} = require("electron");
const {getStore, updateStore} = require("@/electronApp/store");

module.exports = async () => {
    // 加载语言
    const language = await getStore('language');
    let storeLanguage;
    if (!language || !['cn', 'en'].includes(language)) {
        const lg = app.getPreferredSystemLanguages();
        if (lg?.[0]?.includes('zh')) {
            storeLanguage = 'cn'
        } else {
            storeLanguage = 'en'
        }
        updateStore('language', storeLanguage);
    } else {
        storeLanguage = language;
    }
    app._lang = storeLanguage;
}
