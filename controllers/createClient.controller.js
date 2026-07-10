const signUpUser = require("../auth/sign-up");

const createClient = async (req, res) => {
  try {
    const { name, clientKey } = req.body;
    if (!name || !clientKey) {
      return res.status(400).json({
        message: "name and clientKey are required",
      });
    }
    const newUser = await signUpUser(name, clientKey);
    return res.status(200).json({
      message: "User created",
      name: newUser.name,
      clientKey: newUser.clientKey,
      capacity: newUser.capacity,
      remainingToken: newUser.remainingToken,
      refillRate: newUser.refillRate,
      lastRefill: newUser.lastRefill,
    });
  } catch (error) {
    return res.status(403).json({ message: "Problem with creating the user" });
  }
};
module.exports = createClient;
