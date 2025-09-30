const path = require('path')
const {appStoragePath} = require("@/electronApp/helper/index")
const paramsValid = require("@/core/base/ParamsValid")
const printPdf = require("@/core/printPdf");

module.exports = async (req, res, next) => {
    try {
        const {pdfs} = req.body;
        paramsValid.validArrayObject(pdfs, 'pdfs');
        const results = await Promise.all(pdfs.map(async (item, index) => {
            paramsValid.validObjectHasProperty(item, `pdfs.${index}`, ['pdfFileName', 'printOptions']);
            const {pdfFileName} = item
            paramsValid.validString(pdfFileName, 'fileName');
            const filePath = path.join(appStoragePath.getWebPrintPdfsFolder(), pdfFileName);
            await paramsValid.validLocalFileIsExist(filePath, 'filePath');
            return {
                ...item,
                pdfFileName,
                pdfFilePath: filePath,
                pdfUrl: printPdf._generatePdfUrl({fileName: pdfFileName})
            };
        }))
        return res.json({
            data: results
        })
    } catch (err) {
        next(err)
    }
};
