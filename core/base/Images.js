const { Jimp, loadFont, HorizontalAlign, VerticalAlign, cssColorToHex } = require("jimp");
const { SANS_16_WHITE, SANS_32_WHITE } = require("jimp/fonts");
const fs = require("fs-extra");
const path = require("path");

class Images {
    async generateNumberBadge(num = 1) {
        try {
            const colors = {
                green: 'rgb(82, 196, 26)',
                red: 'rgb(255, 77, 79)',
                yellow: 'rgb(250, 173, 20)'
            }
            let numString = num + ''
            if (num > 99) {
                numString = '99'
            }
            const font = await loadFont(num > 9 ? SANS_16_WHITE : SANS_32_WHITE);
            const radius = 16
            const image = new Jimp({
                width: radius * 2,
                height: radius * 2,
                color: cssColorToHex(colors.yellow)
            });
            image.circle({ radius });
            await image.print({
                font,
                x: 0,
                y: 0,
                text: {
                    text: numString,
                    alignmentX: HorizontalAlign.CENTER,
                    alignmentY: VerticalAlign.MIDDLE
                },
                maxWidth: radius * 2,
                maxHeight: radius * 2
            });
            image.scale(0.5)
            return await image.getBase64("image/jpeg", {
                quality: 90,
            });
        } catch (err) {
            console.error(`generateNumberBadge error:${err}`)
            return null
        }
    }

    async _generateNumberBadgeJsonFiles() {
        const list = (new Array(99)).fill(undefined).map((item, index) => index + 1);
        const base64Obj = {}
        await Promise.all(list.map(async item => {
            base64Obj[item] = await this.generateNumberBadge(item)
        }));
        fs.writeFile(path.join(__dirname, 'numsBase64.json'), JSON.stringify(base64Obj))
    }
}

module.exports = new Images();
