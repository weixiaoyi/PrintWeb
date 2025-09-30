const express = require("express");
const router = express.Router();
const getHtmlLogs = require("./getHtmlLogs")
const getPdfLogs = require("./getPdfLogs")
const getPrintLogs = require("./getPrintLogs")
const clearHtmlLogs = require("./clearHtmlLogs")
const clearPdfLogs = require("./clearPdfLogs")
const clearPrintLogs = require("./clearPrintLogs")
const getLogsExpireDay = require("./getLogsExpireDay")

router.post("/getHtmlLogs", getHtmlLogs)
router.post("/getPdfLogs", getPdfLogs)
router.post("/getPrintLogs", getPrintLogs)
router.post("/clearHtmlLogs", clearHtmlLogs)
router.post("/clearPdfLogs", clearPdfLogs)
router.post("/clearPrintLogs", clearPrintLogs)
router.get("/getLogsExpireDay", getLogsExpireDay)

module.exports = router;
