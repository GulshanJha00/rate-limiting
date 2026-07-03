const User = require("../model/user.model")

const signUpUser = async (name,clientKey) => {

    const now = Date.now();
    const tokenLimit = 10

    const user = await User.create({
        name,
        clientKey,
        tokenLimit : tokenLimit,
        remainingToken : tokenLimit,
        lastRefill: now
    })
    return user;

}

module.exports = signUpUser