const requiredEnv = require("@/core/base/RequiredEnv")

module.exports = async (req, res, next) => {
    try {
        const { forceDownload } = req.body
        const channel = requiredEnv.getStandardChannel();
        if (channel === 'chromium' && forceDownload !== true) {
            return res.json({
                data: true,
                success: true,
            });
        } else {
            await requiredEnv.checkChromium();
            return res.json({
                data: true,
                success: true,
            });
        }
    } catch (err) {
        next(err);
    }
};
