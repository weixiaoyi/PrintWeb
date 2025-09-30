const { app: electronApp } = require('electron');
const express = require("express");
const cookieParser = require('cookie-parser');
const getPort = require("get-port").default;
const app = express();
require("express-ws")(app);
const noticeWarn = require("@/core/base/NoticeWarn");
const lang = require("@/electronApp/helper/lang")

app.use(cookieParser());
app.use(express.json({
    limit: "1024mb"
}));

const api = require("./api/index");
const websockets = require("./websocket/index");

module.exports = async () => {
    api({ app });
    getPort({
        port: [16794, 16805, 19235] // 端口按顺序查找可用的
    }).then((port) => {
        console.log(`App listening on port ${port}`);
        app.listen(port, () => {
            electronApp.port = port
            electronApp.protocol = 'http'
            websockets({ server: app });
        });
    }).catch((err) => {
        noticeWarn.notification(lang('端口初始化失败'), err?.message)
    })
}

