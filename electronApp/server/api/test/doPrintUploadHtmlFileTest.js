const path = require("path");
const fs = require("fs-extra")
const printer = require("@/core/printPdf");
const { appStoragePath } = require("@/electronApp/helper")
const paramsValid = require("@/core/base/ParamsValid")
const generateHtml = require("@/core/generateHtml");
const generatePdf = require("@/core/generatePdf");

// 上传html文件打印测试
module.exports = async (req, res, next) => {
    try {
        const { num = 1, fileName, filePath } = req.body
        paramsValid.validString(fileName, 'fileName');
        paramsValid.validString(filePath, 'filePath');
        await fs.ensureDir(appStoragePath.getWebPrintPdfsFolder());
        const content = await fs.readFile(filePath, 'utf8');
        if (!(content.includes('<html') && content.includes('<body'))) {
            throw new Error('this not a valid html file');
        }
        const result = await Promise.all(new Array(num).fill(0).map(async () => {
            const htmlResult = await generateHtml.generateHtmlByDom(content)
            return await generatePdf.generatePdfByLocalHtml(htmlResult.htmlPath, {
                paperFormat: 'A4'
            });
        }))
        await Promise.all(result.map(async (item) => {
            return await printer.print(item.pdfPath, {
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
