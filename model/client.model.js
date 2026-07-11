const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    clientKey: {
        type: String,
        unique: true,
    },
    capacity: Number,
    remainingToken: Number,
    refillRate: Number,
    algorithm: {
        type: String,
        default: "token_bucket",
    },
    lastRefill: {
        type: Date,
        default: Date.now,
    },
}, {
    optimisticConcurrency: true
});

module.exports = mongoose.model("user", UserSchema);