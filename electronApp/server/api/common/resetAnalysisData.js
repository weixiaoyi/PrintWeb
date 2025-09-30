const printPdf = require("@/core/printPdf/index")
const generatePdf = require("@/core/generatePdf/index")

module.exports = async (req, res, next) => {
    try {
        printPdf.resetAnalysisData();
        generatePdf.resetAnalysisData();
        return res.json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
