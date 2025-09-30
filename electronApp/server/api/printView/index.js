const express = require("express");
const router = express.Router();
const batchSearchPdf = require("./batchSearchPdf");

router.post("/batchSearchPdf", batchSearchPdf)

module.exports = router;
