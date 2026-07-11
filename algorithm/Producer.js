const Producer = (user) => {

    const refillTime = Number(user.refillRate);

    const elapsed =
        Date.now() - user.lastRefill.getTime();

    return Math.floor(elapsed / refillTime);
};

module.exports = Producer;