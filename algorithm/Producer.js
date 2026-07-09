require("dotenv").config()

const Producer = async (user) => {
    const refillTime = Number(process.env.RESET_TIME); 
    const currTime = Date.now();
    const elapsed = currTime - user.lastRefill;
    const token = Math.floor(elapsed/refillTime)
    return token
};

module.exports = Producer