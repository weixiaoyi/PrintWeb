const { app } = require("electron");

class PathToUrl {
    constructor() {
    }

    generateOrigin() {
        return `${app.protocol}://127.0.0.1:${app.port}`;
    }
}

module.exports = new PathToUrl();


