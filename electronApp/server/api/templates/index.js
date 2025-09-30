const express = require("express");
const router = express.Router();
const getCommonTemplates = require("./getCommonTemplates");

router.get("/getCommonTemplates", getCommonTemplates)
module.exports = router;
