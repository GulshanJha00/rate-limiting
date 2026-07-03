const express = require("express");
const User = require("../model/user.model");
const signUpUser = require("../auth/sign-up");
const Producer = require("../controllers/Producer");

const router = express.Router();
router.get("/", (req, res) => {
  res.send("Hello");
});
router.post("/check", async (req, res) => {
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
        .status(404)
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
      return res.status(404).json({message:"DENIED ACCESS. Please try after 5 seconds"})
  }

    const users = await User.findOneAndUpdate(
      { clientKey },
      { remainingToken: addedToken, lastRefill: currTime },
    );
    return res.json({
      message: "Allow",
      name,
      clientKey,
      LimitToken: user.tokenLimit,
      RequestToken: addedToken,
      lastRefill: user.lastRefill,
    });

});
module.exports = router;
