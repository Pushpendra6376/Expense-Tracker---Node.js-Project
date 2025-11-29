const Payment = require("../models/payment");
const { createCashfreeOrder } = require("../services/cashfreeService");
const { Cashfree, CFEnvironment } = require("cashfree-pg");

// Initialize Cashfree
const cashfree = new Cashfree(CFEnvironment.SANDBOX, process.env.CASHFREE_APPID, process.env.CASHFREE_SECRETKEY);

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.userId;
        const orderId = "devstudio_" + Date.now();

        // Save order in DB as PENDING
        await Payment.create({
            orderId,
            userId,
            amount,
            status: "PENDING"
        });

        // Create Cashfree order
        const cfOrder = await createCashfreeOrder({
            orderId,
            amount,
            customerId: `user_${userId}`,
            customerPhone: req.body.phone || "9999999999"
        });

        res.status(200).json({ cfOrder }); // <-- cfOrder ke andar payment_link aayega
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
    try {
        const { order_id } = req.query;

        const cfResponse = await cashfree.PGOrderFetchPayments(order_id);

        let status = "FAILED";
        if (cfResponse?.data?.[0]?.txStatus === "SUCCESS") {
            status = "SUCCESSFUL";
        }

        // Update DB
        const payment = await Payment.findOne({ where: { orderId: order_id } });
        if (payment) {
            payment.status = status;
            await payment.save();
        }

        // Update user premium if successful
        if (status === "SUCCESSFUL") {
            const User = require("../models/user");
            const user = await User.findByPk(payment.userId);
            user.isPremium = true;
            await user.save();
        }

        res.json({ status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Payment verification failed" });
    }
};
