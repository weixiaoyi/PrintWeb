const path = require('path')
const { appStoragePath } = require("@/electronApp/helper/index")
const send = require("send")
const paramsValid = require("@/core/base/ParamsValid")

module.exports = async (req, res, next) => {
    try {
        const { fileName } = req.params;
        paramsValid.validString(fileName, 'req.params.fileName')
        const filePath = path.join(appStoragePath.getWebPrintPdfsFolder(), fileName);
        await paramsValid.validLocalFileIsExist(filePath, 'filePath')
        try {
            send(req, filePath).pipe(res);
        } catch (err) {
            return res.sendFile(filePath);
        }
    } catch (err) {
        next(err)
    }
};
