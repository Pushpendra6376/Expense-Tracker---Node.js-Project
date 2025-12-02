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
        const orderId = "ExpenseApp" + Date.now();

        // Saving order in DB as PENDING
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
            customerPhone: req.body.phone || "9999999999",
        });

        res.status(200).json({ cfOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
    try {
        const { order_id } = req.query;
        console.log("🔍 VERIFY ORDER ID =>", order_id);
        
        const cfResponse = await cashfree.PGOrderFetchPayments(order_id);
        console.log("Cashfree Verify Data =>", cfResponse.data);

        let payments = cfResponse.data;
        console.log("Cashfree Payments =>", payments);
        const successPayment = payments.find(p => p.payment_status === "SUCCESS");

        if (successPayment) {
            await Payment.update(
                { status: "SUCCESSFUL" },
                { where: { orderId: order_id } }
            );

            return res.json({
                message: "Payment Successful",
                status: "SUCCESSFUL"
            });
        }

        // Otherwise pending/failed
        await Payment.update(
            { status: "PENDING" },
            { where: { orderId: order_id } }
        );

        return res.json({
            message: "Payment Not Completed",
            status: "FAILED"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Payment verification failed" });
    }
};
