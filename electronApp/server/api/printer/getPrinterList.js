const systemPrinter = require("@/core/base/SystemPrinter/index");

// 获取打印机列表
module.exports = async (req, res, next) => {
    try {
        const result = await systemPrinter.getPrinterList();
        return res.json({
            data: (result || []).reverse(),
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
