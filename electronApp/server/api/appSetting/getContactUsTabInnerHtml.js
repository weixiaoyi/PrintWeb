const { getStore } = require("@/electronApp/store");

module.exports = async (req, res, next) => {
    try {
        const content = await getStore('contactUsTabInnerHtml');
        return res.json({
            data: content,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
