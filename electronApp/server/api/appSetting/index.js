const express = require("express");
const router = express.Router();
const getAutoLaunchStatus = require("./getAutoLaunchStatus");
const switchAutoLaunchStatus = require("./switchAutoLaunchStatus");
const getMachineId = require("./getMachineId");
const getAuthority = require("./getAuthority");
const importAuthorityCert = require("./importAuthorityCert");
const getLanguage = require("./getLanguage")
const setLanguage = require("./setLanguage")
const downloadStandardPdfEngine = require("./downloadStandardPdfEngine");
const getTabsVisibility = require("./getTabsVisibility");
const getContactUsTabInnerHtml = require("./getContactUsTabInnerHtml");
const getTitle = require("./getTitle");
const getThemeColor = require("./getThemeColor");

router.get("/getAutoLaunchStatus", getAutoLaunchStatus)
router.post("/switchAutoLaunchStatus", switchAutoLaunchStatus)
router.get("/getMachineId", getMachineId)
router.get("/getAuthority", getAuthority)
router.post("/importAuthorityCert", importAuthorityCert)
router.get("/getLanguage", getLanguage)
router.post("/setLanguage", setLanguage)
router.post("/downloadStandardPdfEngine", downloadStandardPdfEngine)
router.get('/getTabsVisibility', getTabsVisibility)
router.get("/getContactUsTabInnerHtml", getContactUsTabInnerHtml)
router.get("/getTitle", getTitle)
router.get("/getThemeColor", getThemeColor)

module.exports = router;
