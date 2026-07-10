const Producer = (user) => {
    const refillTime = Number(user.refillRate); 
    const currTime = Date.now();
    const elapsed = currTime - user.lastRefill;

        console.log({
        refillTime,
        elapsed,
        token: Math.floor(elapsed / refillTime),
    });

    const token = Math.floor(elapsed/refillTime)
    return token
};

module.exports = Producer