const express = require("express");
const User = require("../model/user.model");
const signUpUser = require("../auth/sign-up");
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

  const token = Producer()

  if (user.remainingToken > 0 ) {
    let token = user.remainingToken;
    token = token - 1;
    const users = await User.findOneAndUpdate(
      { clientKey },
      { remainingToken: token },
    );
    return res.json({
      message: "Allow",
      name,
      clientKey,
      RequestToken: user.remainingToken,
      LimitToken: user.tokenLimit,
    });
  } else {
    return res.json(
      { message: "Access Denied, Please try again after some time" },
      { status: 404 },
    );
  }

  res.send({ name, clientKey });
});
module.exports = router;
