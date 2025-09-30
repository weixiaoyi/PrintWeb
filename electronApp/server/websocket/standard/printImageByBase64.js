const generatePdf = require("@/core/generatePdf")
const printPdf = require("@/core/printPdf")
const generateHtml = require("@/core/generateHtml");

module.exports = async (payload, onlyPdf = false) => {
    const { base64, pdfOptions, printOptions, extraOptions = {} } = payload
    const htmlResult = await generateHtml.generateHtmlByImageBase64(base64, extraOptions);
    const pdfResult = await generatePdf.generatePdfByLocalHtml(htmlResult.htmlPath, pdfOptions, extraOptions);
    if (onlyPdf) {
        return pdfResult
    }
    const printResult = await printPdf.print(pdfResult.pdfPath, printOptions, extraOptions)
    return {
        ...printResult
    }
};
