document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expenseForm");
    const expenseList = document.getElementById("expenseList");
    const membershipBtn = document.querySelector(".membership button");
    const showLeaderboardBtn = document.getElementById("show-leaderboard");
    const leaderboardSection = document.getElementById("leaderboard-section");
    const leaderboardBody = document.getElementById("leaderboard-body");
    const premiumMessage = document.getElementById("premium-message");

    const cashfree = Cashfree({ mode: "sandbox" });

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
                headers: { "Authorization": `Bearer ${token}` },
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
    membershipBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("http://localhost:3000/payment/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                },
                body: JSON.stringify({ amount: 299 }),
            });

            const data = await res.json();
            if (!data || !data.cfOrder) return alert("Order not created");

            // Launch Cashfree payment
            new cashfree.checkout({
                paymentSessionId: data.cfOrder.payment_session_id,
                redirectTarget: "_self"
            });

        } catch (e) {
            console.error("Error while creating order:", e);
            alert("Error while creating order");
        }
    });

    // Show leaderboard
    showLeaderboardBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("http://localhost:3000/expense/leaderboard", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await res.json();

            leaderboardBody.innerHTML = "";
            data.leaderboard.forEach((user, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.username}</td>
                    <td>${user.totalExpense || 0}</td>
                `;
                leaderboardBody.appendChild(tr);
            });

            leaderboardSection.style.display = "block";

        } catch (err) {
            console.error(err);
            alert("Failed to fetch leaderboard");
        }
    });

    // Check if user is already premium
    (async () => {
        try {
            const res = await fetch("http://localhost:3000/expense/", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.status === 200) {
                const { expenses } = await res.json();
                // Optional: handle UI for premium users if needed
            }
        } catch (err) {
            console.error(err);
        }
    })();

    fetchExpenses();
});
