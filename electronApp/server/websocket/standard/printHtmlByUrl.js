const generatePdf = require("@/core/generatePdf")
const printPdf = require("@/core/printPdf")

module.exports = async (payload, onlyPdf = false) => {
    const { url, pdfOptions, printOptions, extraOptions = {} } = payload
    const pdfResult = await generatePdf.generatePdfByRemoteHtmlUrl(url, pdfOptions, extraOptions);
    if (onlyPdf) {
        return pdfResult
    }
    const printResult = await printPdf.print(pdfResult.pdfPath, printOptions, extraOptions)
    return {
        ...printResult
    }
};
