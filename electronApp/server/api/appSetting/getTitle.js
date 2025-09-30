const { getStore } = require("@/electronApp/store");

module.exports = async (req, res, next) => {
    try {
        const title = await getStore('title');
        return res.json({
            data: title,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
