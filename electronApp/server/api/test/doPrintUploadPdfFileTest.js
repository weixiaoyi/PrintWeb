const path = require("path");
const fs = require("fs-extra")
const printer = require("@/core/printPdf");
const { appStoragePath } = require("@/electronApp/helper")
const paramsValid = require("@/core/base/ParamsValid")
const writeReadFileStream = require("@/core/base/WriteReadFileStream")

// 上传文件打印Pdf测试
module.exports = async (req, res, next) => {
    try {
        const { num = 1, fileName, filePath } = req.body
        paramsValid.validString(fileName, 'fileName');
        paramsValid.validString(filePath, 'filePath');
        await paramsValid.validFileTypeFromFile(filePath, 'pdf')
        const testFile = writeReadFileStream.getUidFileOnlyExtension('.pdf')
        const targetFilePath = path.join(appStoragePath.getWebPrintPdfsFolder(), testFile.fileName)
        await fs.ensureDir(appStoragePath.getWebPrintPdfsFolder())
        await fs.copy(filePath, targetFilePath);
        await Promise.all(new Array(num).fill(0).map(async (p) => {
            return await printer.print(targetFilePath, {
                paperFormat: 'A4'
            });
        }));
        return res.json({
            success: true,
        });
    } catch (err) {
        next(err)
    }
};
