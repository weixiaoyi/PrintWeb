const { CookieJar } = require("tough-cookie")

class MakeGot {
    async makeOptions(url, headers, cookies) {
        if (!url) {
            throw new Error("makeGotOptions Missing URL");
        }
        const gotOptions = {};
        if (headers) {
            gotOptions.headers = headers;
        }
        if (cookies) {
            const cookieJar = new CookieJar();
            await Promise.all(Object.entries(cookies).map(([key, value]) => {
                return cookieJar.setCookie(`${key}=${value}`, url);
            }))
            gotOptions.cookieJar = cookieJar
        }
        return gotOptions;
    }

}

module.exports = new MakeGot()
