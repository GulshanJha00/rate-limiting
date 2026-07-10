const mongoose = require("mongoose")

const User = new mongoose.Schema({
    name : String,
    clientKey : String,
    capacity : Number,
    remainingToken : Number,
    refillRate: Number,
    lastRefill:{
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('user',User);