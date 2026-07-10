const User = require("../model/client.model");
const signUpUser = require("../auth/sign-up");
const Producer = require("../algorithm/Producer");
const xSecond = require("../algorithm/xSecond");
require("dotenv").config();
const checkRateLimit = async (req, res) => {
  const { name, clientKey } = req.body;

  const user = await User.findOne({ clientKey });
  if (!user) {
    return res.status(401).json({
      message:"Unauthorized"
    })
  }

  const currTime = Date.now();
  const updateToken = await Producer(user);
  const refillRate = user.refillRate;

  let newLastRefill = user.lastRefill;

  if (updateToken > 0) {
    newLastRefill = user.lastRefill + updateToken * refillRate;
  }
  const token = user.remainingToken;

  let addedToken = Math.min(token + updateToken, user.capacity);

  let xSec = await xSecond(newLastRefill, user);

  if (addedToken > 0) {
    addedToken--;
  } else {

    res.set("X-RateLimit-Limit", user.capacity);
    res.set("X-RateLimit-Remaining", 0);
    res.set("X-RateLimit-Reset", xSec);
    return res.status(429).json({ 
      "allowed":false,
      "retryAfter": xSec
     });
  }

  await User.findOneAndUpdate(
    { clientKey },
    { remainingToken: addedToken, lastRefill: newLastRefill },
  );
  res.set("X-RateLimit-Limit", user.capacity);
  res.set("X-RateLimit-Remaining", addedToken);
  res.set("X-RateLimit-Reset", xSec);
  return res.json({
    "allowed": true,
    "remainingTokens":addedToken
  });
};

module.exports = checkRateLimit;
