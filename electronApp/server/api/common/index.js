const express = require("express");
const router = express.Router();
const getAnalysisData = require("./getAnalysisData");
const viewWebPrintPdfFile = require("./viewWebPrintPdfFile");
const viewWebPrintHtmlFile = require("./viewWebPrintHtmlFile");
const shellOpenPath = require("./shellOpenPath");
const shellOpenExternal = require("./shellOpenExternal");
const shellShowItemInFolder = require("./shellShowItemInFolder");
const openConsole = require("./openConsole");
const resetAnalysisData = require("./resetAnalysisData");
const printPreviewFile = require("./printPreviewFile");
const { storageFile, resJson } = require("./uploadFile");

router.get("/sse/getAnalysisData", getAnalysisData)
router.get("/viewWebPrintPdfFile/:fileName", viewWebPrintPdfFile)
router.get("/viewWebPrintHtmlFile/:fileName", viewWebPrintHtmlFile)
router.post("/shellOpenExternal", shellOpenExternal);
router.post("/shellOpenPath", shellOpenPath);
router.post("/shellShowItemInFolder", shellShowItemInFolder);
router.get("/openConsole", openConsole);
router.post("/resetAnalysisData", resetAnalysisData)
router.post("/uploadFile", storageFile, resJson);
router.post("/printPreviewFile", printPreviewFile);

module.exports = router;
