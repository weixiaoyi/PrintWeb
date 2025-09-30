const record = require("@/core/base/Record")

module.exports = async (req, res, next) => {
    try {
        return res.json({
            data: record.getExpireDay(),
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
