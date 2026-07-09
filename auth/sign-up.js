const User = require("../model/client.model")

const signUpUser = async (name,clientKey) => {

    const now = Date.now();
    const capacity = 10

    const user = await User.create({
        name,
        clientKey,
        capacity : capacity,
        remainingToken : capacity,
        lastRefill: now
    })
    return user;

}

module.exports = signUpUser