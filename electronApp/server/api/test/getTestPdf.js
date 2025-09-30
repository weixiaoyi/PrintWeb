const { appStoragePath } = require("@/electronApp/helper")
const paramsValid = require("@/core/base/ParamsValid")

module.exports = async (req, res, next) => {
    try {
        const testPdfLocalPath = appStoragePath.getAppAsarUnpackByFile('testPrint.pdf');
        await paramsValid.validLocalFileIsExist(testPdfLocalPath, 'testPrint.pdf');
        return res.sendFile(testPdfLocalPath)
    } catch (err) {
        next(err)
    }
};
