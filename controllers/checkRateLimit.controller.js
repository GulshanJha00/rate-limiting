const User = require("../model/user.model");
const signUpUser = require("../auth/sign-up");
const Producer = require("../algorithm/Producer");
const xSecond = require("../algorithm/xSecond")
const checkRateLimit = async (req, res) => {
  const { name, clientKey } = req.body;

  const user = await User.findOne({ clientKey });
  if (!user) {
    try {
      const newUser = await signUpUser(name, clientKey);
      return res.status(200).json({
        message: "User created",
        name: newUser.name,
        clientKey: newUser.clientKey,
        tokenLimit: newUser.tokenLimit,
        remainingToken: newUser.remainingToken,
        lastRefill: newUser.lastRefill,
      });
    } catch (error) {
      return res
        .status(403)
        .json({ message: "Problem with creating the user" });
    }
  }
  
  const currTime = Date.now();
  const updateToken = await Producer(user);
  const token = user.remainingToken
  let addedToken = token + updateToken

  if (addedToken >= user.tokenLimit) {
    addedToken = user.tokenLimit
  }

  if (addedToken > 0) {
    addedToken--;
  } else {
      let xSec = await xSecond(user)
      let msg = `DENIED ACCESS. Please try after ${xSec} seconds`
      return res.status(429).json({message:msg})
  }

    await User.findOneAndUpdate(
      { clientKey },
      { remainingToken: addedToken, lastRefill: currTime },
    );
    return res.json({
      message: "Allow",
      name,
      clientKey,
      LimitToken: user.tokenLimit,
      RequestToken: addedToken,
      lastRefill: currTime,
    });

};


module.exports = checkRateLimit