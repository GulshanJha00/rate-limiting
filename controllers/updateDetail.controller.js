const User = require("../model/client.model");

const allowedFields = ["capacity", "remainingToken"];

const updateDetail = async (req, res) => {
  const { clientKey } = req.params;
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (updates.capacity !== undefined && updates.capacity < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid token limit",
    });
  }

  if (updates.remainingToken !== undefined && updates.remainingToken < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid remaining token",
    });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields provided for update",
    });
  }

  let user;

  try {
    user = await User.findOneAndUpdate({ clientKey }, updates, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Client updated successfully",
    client: user,
  });
};

module.exports = updateDetail;
