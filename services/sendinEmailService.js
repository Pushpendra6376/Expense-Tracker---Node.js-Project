const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

exports.sendResetEmail = async (email, message) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.sender = {
            email: "pp5395021@gmail.com",
            name: "Expense Tracker"
        };

        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.subject = "Password Reset (Test Email)";
        sendSmtpEmail.htmlContent = `
            <h2>Forgot Password Test Email</h2>
            <p>${message}</p>
        `;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Email Sent Successfully:", result);

    } catch (err) {
        console.log("Email Error:", err.response?.text || err);
    }
};
