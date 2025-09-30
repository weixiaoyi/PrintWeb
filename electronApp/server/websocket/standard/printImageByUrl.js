const generatePdf = require("@/core/generatePdf")
const printPdf = require("@/core/printPdf")
const generateHtml = require("@/core/generateHtml");

module.exports = async (payload, onlyPdf = false) => {
    const { url, pdfOptions, printOptions, extraOptions = {} } = payload
    const htmlResult = await generateHtml.generateHtmlByImageUrl(url, extraOptions)
    const pdfResult = await generatePdf.generatePdfByLocalHtml(htmlResult.htmlPath, pdfOptions, extraOptions);
    if (onlyPdf) {
        return pdfResult
    }
    const printResult = await printPdf.print(pdfResult.pdfPath, printOptions, extraOptions)
    return {
        ...printResult
    }
};
