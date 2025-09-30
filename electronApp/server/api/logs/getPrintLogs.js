const record = require("@/core/base/Record")

module.exports = async (req, res, next) => {
    try {
        const results = await record.queryPrintRecord(req.body)
        return res.json({
            data: results,
            success: true,
        });
    } catch (err) {
        next(err)
    }
};
