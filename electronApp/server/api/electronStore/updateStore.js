const { updateStore } = require("@/electronApp/store")

module.exports = async (req, res, next) => {
    try {
        const { key, value } = req.body
        await updateStore(key, value)
        return res.json({
            success: true,
        });
    } catch (err) {
        next(err)
    }
};
