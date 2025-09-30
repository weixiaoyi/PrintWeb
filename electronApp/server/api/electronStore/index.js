const express = require("express");
const router = express.Router();
const getStore = require("./getStore");
const updateStore = require("./updateStore");

router.get("/getStore", getStore)
router.post("/updateStore", updateStore)
module.exports = router;
