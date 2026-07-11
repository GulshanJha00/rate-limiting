const xSecond = (lastRefill, user) => {

    const refillTime = Number(user.refillRate);

    const elapsed =
        Date.now() - lastRefill.getTime();

    const remaining = Math.max(
        0,
        refillTime - elapsed
    );

    return Math.ceil(remaining / 1000);
};

module.exports = xSecond;