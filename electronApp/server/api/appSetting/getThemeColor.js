const { getStore } = require("@/electronApp/store");

module.exports = async (req, res, next) => {
    try {
        const themeColor = await getStore('themeColor');
        return res.json({
            data: themeColor,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
