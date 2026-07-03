const express = require("express");

const checkRateLimit = require("../controllers/checkRateLimit.controller")

const router = express.Router();


router.post("/check", checkRateLimit)
module.exports = router;