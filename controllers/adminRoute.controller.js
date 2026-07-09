const User = require("../model/client.model")

const adminRoute = async (req,res) =>{
    const {clientKey} = req.params
    const user = await User.findOne({clientKey: clientKey})
    console.log(user)
        return res.status(200).json({
            success: true,
            user,
        });
}

module.exports = adminRoute