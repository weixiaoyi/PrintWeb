const generateHtml = require("@/core/generateHtml")
const generatePdf = require("@/core/generatePdf")
const printPdf = require("@/core/printPdf")

module.exports = async (payload, onlyPdf = false) => {
    const { content, pdfOptions, printOptions, extraOptions = {} } = payload
    const htmlResult = await generateHtml.generateHtmlByDom(content, extraOptions)
    const pdfResult = await generatePdf.generatePdfByLocalHtml(htmlResult.htmlPath, pdfOptions, extraOptions);
    if (onlyPdf) {
        return pdfResult
    }
    const printResult = await printPdf.print(pdfResult.pdfPath, printOptions, extraOptions)
    return {
        ...printResult
    }
};
