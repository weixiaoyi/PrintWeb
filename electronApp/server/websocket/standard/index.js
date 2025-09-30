const express = require("express");
const router = express.Router();
const websocketUtils = require("@/core/base/WebsocketUtils")

router.ws("/", (ws) => {
    ws.on("message", async (payload) => {
        let message = null
        try {
            message = websocketUtils.preDealJsonPayload(payload)
            websocketUtils.verifyJsonPayload(payload)
            const res = await require(`./${message.type}`)(message)
            ws.send(JSON.stringify({
                id: message?.id,
                timestamp: Date.now(),
                type: message?.type,
                data: res,
                success: true,
                extraOptions: message?.extraOptions
            }));
        } catch (err) {
            console.error(err);
            let errMsg = err?.message || err || '未知错误'
            if (errMsg?.includes("Cannot find module")) {
                errMsg = `not found the type: ${message?.type}`
            }
            ws.send(JSON.stringify({
                id: message?.id,
                timestamp: Date.now(),
                type: message?.type,
                success: false,
                message: errMsg,
                extraOptions: message?.extraOptions
            }));
        }
    });
});

module.exports = router;
