const User = require("../model/client.model")

const signUpUser = async (name,clientKey) => {

    const now = Date.now();
    const capacity = Number(process.env.CAPACITY)
    const refillRate = Number(process.env.RESET_TIME)

    const user = await User.create({
        name,
        clientKey,
        capacity : capacity,
        remainingToken : capacity,
        refillRate: refillRate,
        lastRefill: now
    })
    return user;

}

module.exports = signUpUser