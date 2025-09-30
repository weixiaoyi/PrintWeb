const { getStore } = require("@/electronApp/store");

module.exports = async (req, res, next) => {
    try {
        const { key } = req.query;
        const value = await getStore(key);
        return res.json({
            data: value,
            success: true,
        });
    } catch (err) {
        next(err)
    }
};
