const { app } = require("electron");
const printPdf = require("@/core/printPdf/index")
const generatePdf = require("@/core/generatePdf/index")
const requiredEnv = require("@/core/base/RequiredEnv")

module.exports = async (req, res) => {
    try {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream;charset=utf-8',     // SSE 核心类型
            'Cache-Control': 'no-cache',             // 禁用缓存
            'Connection': 'keep-alive',               // 保持连接
            "Access-Control-Allow-Origin": "*"
        });
        const timer = setInterval(() => {
            const printPdfStates = printPdf.getAnalysisData();
            const generatePdfStates = generatePdf.getAnalysisData();
            const data = {
                printPdfStates,
                generatePdfStates,
                chromeExeChannel: requiredEnv.getStandardChannel(),
            }
            res.write("data: " + JSON.stringify(data) + "\n\n");
        }, 1000)
        // 当客户端点击关闭时
        req.on("close", () => {
            clearInterval(timer);
            res.end();
        });
    } catch (err) {
        console.error(err);
        app._win.webContents.send(
            "global/warning",
            `${req.path} execution error: ${err?.message || err || ''}`,
        );
    }
};
