const machineId = require('node-machine-id');

module.exports = async (req, res, next) => {
    try {
        const id = await machineId.machineId()
        return res.json({
            data: id,
            success: true,
        });
    } catch (err) {
        next(err);
    }
};
