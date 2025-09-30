const record = require("@/core/base/Record")

module.exports = async (req, res, next) => {
    try {
        await record.clearPrintRecord();
        return res.json({
            success: true,
        });
    } catch (err) {
        next(err)
    }
};
