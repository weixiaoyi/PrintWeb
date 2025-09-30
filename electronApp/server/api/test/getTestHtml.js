const { appStoragePath } = require("@/electronApp/helper")
const paramsValid = require("@/core/base/ParamsValid")

module.exports = async (req, res, next) => {
    try {
        const testHtmlLocalPath = appStoragePath.getAppAsarUnpackByFile('testHtml.html');
        await paramsValid.validLocalFileIsExist(testHtmlLocalPath, 'testHtml.html');
        return res.sendFile(testHtmlLocalPath)
    } catch (err) {
        next(err)
    }
};
