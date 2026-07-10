const mongoose = require("mongoose")

const connection = async () => {
try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("Connection is successful")
} catch (error) {
    console.log("Error", error)   
}
}
module.exports = connection