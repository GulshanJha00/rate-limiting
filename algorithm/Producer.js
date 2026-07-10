const Producer = async (user) => {
    const refillTime = user.refillRate; 
    const currTime = Date.now();
    const elapsed = currTime - user.lastRefill;
    const token = Math.floor(elapsed/refillTime)
    return token
};

module.exports = Producer