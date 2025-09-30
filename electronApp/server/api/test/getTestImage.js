const { appStoragePath } = require("@/electronApp/helper")
const paramsValid = require("@/core/base/ParamsValid")

module.exports = async (req, res, next) => {
    try {
        const testImageLocalPath = appStoragePath.getAppAsarUnpackByFile('testImage.jpg');
        await paramsValid.validLocalFileIsExist(testImageLocalPath, 'testImage.jpg');
        return res.sendFile(testImageLocalPath)
    } catch (err) {
        next(err)
    }
};
