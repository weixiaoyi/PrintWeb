const systemPrinter = require("@/core/base/SystemPrinter/index");
const paramsValid = require("@/core/base/ParamsValid")

module.exports = async (req, res, next) => {
    try {
        const { printer } = req.body
        paramsValid.validObject(printer, 'req.body.printer');
        const result = await systemPrinter.setDefaultPrinter(printer)
        return res.json({
            data: result,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
