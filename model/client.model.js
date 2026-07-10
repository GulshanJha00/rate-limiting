const mongoose = require("mongoose")

const User = new mongoose.Schema({
    name : String,
    clientKey : String,
    capacity : Number,
    remainingToken : Number,
    refillRate: Number,
    algorithm:{
        type: String,
        default: "token_bucket"
    },
    lastRefill:{
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('user',User);