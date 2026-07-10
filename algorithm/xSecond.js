const xSecond = (lastRefill, user) =>{
    const refillTime = Number(user.refillRate); 
    const currTime = Date.now();

    const elapsed = currTime - lastRefill;
    const remainingMs = Math.max(0, refillTime - elapsed);

    return Math.ceil(remainingMs / 1000);

}
module.exports = xSecond