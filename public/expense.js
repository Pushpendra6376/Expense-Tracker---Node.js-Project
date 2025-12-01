document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expenseForm");
    const expenseList = document.getElementById("expenseList");
    const membershipBtn = document.querySelector(".membership button");
    const cashfree = Cashfree({
                mode: "sandbox",
            });

    // Get Bearer token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first!");
        window.location.href = "/";
        return;
    }

    // Fetch and display all expenses
    async function fetchExpenses() {
        try {
            const res = await fetch("http://localhost:3000/expense/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.status !== 200) {
                alert("Failed to fetch expenses");
                return;
            }

            const { expenses } = await res.json();
            expenseList.innerHTML = "";

            expenses.forEach(exp => {
                const li = document.createElement("li");
                li.innerHTML = `
                    ${exp.amount} - ${exp.description} - ${exp.category}
                    <button data-id="${exp.id}">Delete</button>
                `;
                expenseList.appendChild(li);

                li.querySelector("button").addEventListener("click", async () => {
                    await deleteExpense(exp.id);
                });
            });
        } catch (err) {
            console.error(err);
            alert("Failed to fetch expenses");
        }
    }

    // Add new expense
    expenseForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            amount: document.getElementById("amount").value,
            description: document.getElementById("description").value,
            category: document.getElementById("category").value,
        };

        try {
            const res = await fetch("http://localhost:3000/expense", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (res.status === 201) {
                expenseForm.reset();
                fetchExpenses();
            } else {
                alert(result.message || "Failed to add expense");
            }
        } catch (err) {
            console.error(err);
            alert("Error adding expense");
        }
    });

    // Delete expense
    async function deleteExpense(id) {
        try {
            const res = await fetch(`http://localhost:3000/expense/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (res.status === 200) {
                fetchExpenses();
            } else {
                const result = await res.json();
                alert(result.message || "Failed to delete expense");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting expense");
        }
    }

    // Membership button click
    document.querySelector(".membership button").addEventListener("click", async () => {
        console.log(" BUTTON CLICKED");

        const token = localStorage.getItem("token");
        if (!token){
            console.log(" No Token Found");
            return alert("Please login first");
        }

        console.log(" Sending Order Request to Backend...");

        try {
            const res = await fetch("http://localhost:3000/payment/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ amount: 299 })
            });

            console.log(" Raw Response =>", res.status);

            const data = await res.json();
            console.log(" Parsed Backend Response =>", data);

            if (!data || !data.cfOrder) {
                return alert(" Order not created");
            }

            console.log(" ORDER CREATED, SESSION ->", data.cfOrder.payment_session_id);

            const checkout = new cashfree.checkout({
                paymentSessionId: data.cfOrder.payment_session_id,
                redirectTarget: "_blank"
            });

        } catch (e) {
            console.log(" FETCH ERROR:", e);
            alert("Error while creating order");
        }
    });
    fetchExpenses();
});
