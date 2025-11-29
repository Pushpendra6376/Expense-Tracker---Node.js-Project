const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_APPID,
    process.env.CASHFREE_SECRETKEY
);

const createCashfreeOrder = async ({ orderId, amount, customerId, customerPhone, returnUrl }) => {
    const request = {
        order_amount: amount,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
            customer_id: customerId,
            customer_phone: customerPhone
        },
        order_meta: {
            return_url: `http://localhost:3000/payment-status.html?order_id=${orderId}`
        }
    };

    try {
        const response = await cashfree.PGCreateOrder(request);
        return response.data.data; // <-- yaha pe 'data' ka andar ka 'data' return karna important hai
    } catch (error) {
        throw new Error(error.response?.data?.message || "Cashfree order creation failed");
    }
};

module.exports = { createCashfreeOrder };
