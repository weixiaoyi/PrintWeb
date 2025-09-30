const { app } = require("electron");

module.exports = (err, req, res, next) => {
    console.error(err);
    app._win.webContents.send(
        "global/warning",
        `${req.path} execution error: ${err?.message || err || ''}`,
    );
    return res.json({
        message: err?.message || err || '未知错误',
        success: false,
    });
}
