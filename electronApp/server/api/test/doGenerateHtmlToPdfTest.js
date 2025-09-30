const generateHtml = require("@/core/generateHtml")
const generatePdf = require("@/core/generatePdf")

module.exports = async (req, res, next) => {
    try {
        const { content, num = 1, pdfOptions, printOptions } = req.body
        const result = await Promise.all(new Array(num).fill(0).map(async (item) => {
            const htmlResult = await generateHtml.generateHtmlByDom(content)
            return await generatePdf.generatePdfByLocalHtml(htmlResult.htmlPath, pdfOptions);
        }))
        return res.json({
            data: result,
            success: true,
        });

    } catch (err) {
        next(err)
    }
};
