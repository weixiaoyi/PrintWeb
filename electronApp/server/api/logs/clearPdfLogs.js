const record = require("@/core/base/Record")

module.exports = async (req, res, next) => {
    try {
        await record.clearPdfRecord();
        return res.json({
            success: true,
        });
    } catch (err) {
        next(err)
    }
};
