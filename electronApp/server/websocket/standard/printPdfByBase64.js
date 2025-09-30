const generatePdf = require("@/core/generatePdf")
const printPdf = require("@/core/printPdf")

module.exports = async (payload, onlyPdf = false) => {
    const { base64, pdfOptions, printOptions, extraOptions = {} } = payload
    const pdfResult = await generatePdf.generatePdfByBase64(base64, pdfOptions, extraOptions);
    if (onlyPdf) {
        return pdfResult
    }
    const printResult = await printPdf.print(pdfResult.pdfPath, printOptions, extraOptions)
    return {
        ...printResult
    }
};
