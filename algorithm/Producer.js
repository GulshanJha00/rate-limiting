const Producer = async (user) => {
    const refillTime = 5000
    const currTime = Date.now();
    const elapsed = currTime - user.lastRefill;
    const token = Math.floor(elapsed/refillTime)
    return token
};

module.exports = Producer