const fs = require("fs-extra");
const path = require("path");
module.exports = async (req, res, next) => {
    try {
        const jsonFiles = await fs.readdir(path.join(__dirname, './commonTemplateJsons'));
        const jsons = await Promise.all(jsonFiles.map(async (fileName) => {
            const str = await fs.readFile(path.join(__dirname, './commonTemplateJsons', `${fileName}`), 'utf8');
            return JSON.parse(str);
        }))
        return res.json({
            data: jsons,
            success: true,
        });
    } catch (err) {
        next(err)
    }
};
