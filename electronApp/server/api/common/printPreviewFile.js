const printPdf = require("@/core/printPdf")

module.exports = async (req, res, next) => {
    try {
        const { pdfFilePath, printOptions, } = req.body;
        const printResult = await printPdf.print(pdfFilePath, printOptions)
        return res.json({
            success: true,
            data: printResult,
        });
    } catch (err) {
        next(err);
    }
};
