const { sendResetEmail } = require("../services/sendinEmailService");

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if(!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        await sendResetEmail(email, "This is a test email from Expense Tracker!");

        res.status(200).json({ message: "Dummy email sent successfully!" });

    } catch (error) {
        console.log("Forgot Password Error:", error);
        res.status(500).json({ message: "Something went wrong while sending email" });
    }
};
