const { Cashfree, CFEnvironment } = require("cashfree-pg");

// Cashfree 
const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,                
    process.env.CASHFREE_APPID,
    process.env.CASHFREE_SECRETKEY
);

const createCashfreeOrder = async ({ orderId, amount, customerId, customerPhone }) => {
    try {
        const request = {
            order_amount: amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: customerId,
                customer_phone: customerPhone
            },
            order_meta: {
                return_url: `http://localhost:3000/payment/verify?order_id=${orderId}`, 
            }
        };

        const response = await cashfree.PGCreateOrder(request);
        console.log("Cashfree API Response =>", response.data);

        return {  
            order_id: response.data.order_id,
            payment_session_id: response.data.payment_session_id  
        };

    } catch (error) {
        console.log("Cashfree Error", error.response?.data || error);
        throw new Error(error.response?.data?.message || "Order Creation Failed");
    }
};

module.exports = {createCashfreeOrder};