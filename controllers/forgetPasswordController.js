
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const path = require("path");
const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");
const { sendResetEmail } = require("../services/sendinEmailService"); 

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const resetId = uuidv4();

        await ForgotPasswordRequest.create({
            id: resetId,
            userId: user.id,
            isActive: true
        });

        await sendResetEmail(email, resetId);

        res.status(200).json({ message: "Reset link sent to email" });

    } catch (err) {
        res.status(500).json({ message: "Something went wrong", error: err });
    }
};

exports.verifyRequestAndServeForm = async (req, res) => {
  try {
    const { id } = req.params;
    const reqRow = await ForgotPasswordRequest.findOne({ where: { id } });

    if (!reqRow) return res.status(404).send("Invalid reset link.");
    if (!reqRow.isActive) return res.status(400).send("This reset link has already been used or deactivated.");

    return res.sendFile(path.join(__dirname, "..", "public", "html", "reset-password.html"));
  } catch (err) {
    console.error("verifyRequestAndServeForm error:", err);
    return res.status(500).send("Internal Server Error");
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ message: "Password is required" });

    const reqRow = await ForgotPasswordRequest.findOne({ where: { id } });
    if (!reqRow) return res.status(404).json({ message: "Invalid reset request" });
    if (!reqRow.isActive) return res.status(400).json({ message: "This reset link is no longer active" });


    const user = await User.findOne({ where: { id: reqRow.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    reqRow.isActive = false;
    await reqRow.save();

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
