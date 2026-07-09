require("dotenv").config()
const xSecond = async (lastRefill) =>{
    const refillTime = Number(process.env.RESET_TIME); 
    const currTime = Date.now();

    const elapsed = currTime - lastRefill;
    const remainingMs = Math.max(0, refillTime - elapsed);

    return Math.ceil(remainingMs / 1000);

}
module.exports = xSecond