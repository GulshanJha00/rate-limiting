const express = require("express")
require('dotenv').config()
const app = express()
const connection = require("./utils/db-connections")

const router = require("./routes/main.route")

connection()
app.use(express.json());
app.use("/",router)

app.listen(3000,()=>{
    console.log("listening to port 3000")
})