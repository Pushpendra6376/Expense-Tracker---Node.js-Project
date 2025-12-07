const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

exports.sendResetEmail = async (email, resetId) => {
    try {
        const resetLink = `http://localhost:3000/password/resetpassword/${resetId}`;

        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.sender = {
            email: "pp5395021@gmail.com",
            name: "Expense Tracker"
        };

        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.subject = "Password Reset Request";

        sendSmtpEmail.htmlContent = `
            <h3>Password Reset</h3>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" style="color:blue;">Reset Password</a>
            <br/><br/>
            <p>If you did not request this, you can ignore this email.</p>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Email Sent Successfully:", result);

    } catch (err) {
        console.log("Email Error:", err.response?.text || err);
    }
};
