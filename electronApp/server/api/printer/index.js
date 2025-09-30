const express = require("express");
const router = express.Router();
const getPrinterList = require("./getPrinterList");
const doSetDefaultPrinter = require("./doSetDefaultPrinter");
const getPrinterPapers = require("./getPrinterPapers");

router.get("/getPrinterList", getPrinterList);
router.post("/doSetDefaultPrinter", doSetDefaultPrinter);
router.post("/getPrinterPapers", getPrinterPapers);

module.exports = router;
