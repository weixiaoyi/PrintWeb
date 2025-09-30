const { app } = require('electron');
const configs = require("./langConfig")
module.exports = (cn, en) => {
    if (app._lang === 'en' && cn) {
        if (en) return en;
        if (configs[cn]) {
            return configs[cn]
        }
    }
    return cn;
}
