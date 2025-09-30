const { getStore } = require("@/electronApp/store");

module.exports = async (req, res, next) => {
    try {
        const tabsVisibility = await getStore('tabsVisibility');
        return res.json({
            data: tabsVisibility,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
