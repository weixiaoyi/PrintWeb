const express = require("express");
const path = require("path");
const appSetting = require("./appSetting/index")
const common = require("./common/index");
const printer = require("./printer/index");
const test = require("./test/index");
const logs = require("./logs/index");
const electronStore = require("./electronStore/index")
const templates = require("./templates/index");
const printView = require("./printView/index");
const { handleError } = require("@/electronApp/middleware");

module.exports = ({ app }) => {
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // 允许任何源
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        );
        next();
    });

    app.use("/api/appSetting", appSetting)
    app.use("/api/common", common)
    app.use("/api/printer", printer);
    app.use("/api/test", test)
    app.use("/api/logs", logs)
    app.use("/api/electronStore", electronStore)
    app.use("/api/templates", templates)
    app.use("/api/printView", printView)
    app.use("/api/*", (req, res) => {
        return res.status(404).send("404 Not Found");
    })

    app.use(express.static(path.join(__dirname, "../../../vueApp/dist")));
    app.get("/", function (req, res) {
        res.sendFile(path.join(__dirname, "../../../vueApp/dist/index.html"));
    });
    app.use(handleError);
};
