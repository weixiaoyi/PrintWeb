const express = require("express");
const router = express.Router();
const doGenerateHtmlToPdfTest = require("./doGenerateHtmlToPdfTest")
const doPrintTest = require("./doPrintTest");
const doPrintUploadPdfFileTest = require("./doPrintUploadPdfFileTest")
const doPrintUploadHtmlFileTest = require("./doPrintUploadHtmlFileTest")
const getTestHtml = require("./getTestHtml")
const getTestPdf = require("./getTestPdf")
const getTestImage = require("./getTestImage");

router.post("/doGenerateHtmlToPdfTest", doGenerateHtmlToPdfTest)
router.post("/doPrintTest", doPrintTest)
router.post("/doPrintUploadPdfFileTest", doPrintUploadPdfFileTest)
router.post("/doPrintUploadHtmlFileTest", doPrintUploadHtmlFileTest)
router.get("/getTestHtml", getTestHtml)
router.get("/getTestPdf", getTestPdf)
router.get("/getTestImage", getTestImage)

module.exports = router;
