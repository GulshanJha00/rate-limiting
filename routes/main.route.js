const express = require("express");
const createClient = require("../controllers/createClient.controller")
const checkRateLimit = require("../controllers/checkRateLimit.controller")
const adminRoute = require("../controllers/adminRoute.controller")
const updateDetail = require("../controllers/updateDetail.controller")
const router = express.Router();

router.get("/",(req,res)=>{
    res.send("<h1>This is testing page. Go to check page</h1> <a href='/admin/client1'>go to check</a> ")
})

router.post("/check", checkRateLimit)
router.get("/admin/:clientKey",adminRoute)
router.patch("/admin/:clientKey",updateDetail)
router.post("/admin/client",createClient)
module.exports = router;