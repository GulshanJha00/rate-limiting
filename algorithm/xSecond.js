const xSecond = async (user) =>{
    const refillTime = 5000
    const currTime = Date.now();
    const elapsed = currTime - user.lastRefill;
    return (5 - Math.floor(elapsed/1000))
}
module.exports = xSecond