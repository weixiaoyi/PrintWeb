const record = require("@/core/base/Record")

module.exports = async (req, res, next) => {
    try {
        await record.clearHtmlRecord();
        return res.json({
            success: true,
        });
    } catch (err) {
        next(err)
    }
};
