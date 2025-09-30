const path = require("path");
const fs = require("fs-extra")
const printer = require("@/core/printPdf");
const {appStoragePath} = require("@/electronApp/helper")
const paramsValid = require("@/core/base/ParamsValid")
const writeReadFileStream = require("@/core/base/WriteReadFileStream")

// 打印测试
module.exports = async (req, res, next) => {
    try {
        const {num = 1, printOptions} = req.body
        const testFileName = 'testPrint.pdf'
        const tempFile = writeReadFileStream.getUidFileOnlyExtension('.pdf')
        const targetFilePath = path.join(appStoragePath.getWebPrintPdfsFolder(), tempFile.fileName)
        if (!await fs.pathExists(targetFilePath)) {
            const testPrintPdfLocalPath = appStoragePath.getAppAsarUnpackByFile(testFileName);
            await paramsValid.validLocalFileIsExist(testPrintPdfLocalPath, 'testPrintPdfLocalPath');
            await fs.ensureDir(appStoragePath.getWebPrintPdfsFolder())
            await fs.copy(testPrintPdfLocalPath, targetFilePath);
        }

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
