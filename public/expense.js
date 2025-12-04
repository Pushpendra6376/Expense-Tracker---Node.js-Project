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


    // -------------------
    // Fetch expenses
    async function fetchExpenses() {
        try {
            const res = await fetch("http://localhost:3000/expense/", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.status === 200) {
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
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Add expense
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

            if (res.status === 201) {
                expenseForm.reset();
                fetchExpenses();
            } else {
                const result = await res.json();
                alert(result.message || "Failed to add expense");
            }
        } catch (err) {
            console.error(err);
        }
    });

    
    // -------------------
    // Delete expense
    async function deleteExpense(id) {
        try {
            const res = await fetch(`http://localhost:3000/expense/delete/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.status === 200) fetchExpenses();
        } catch (err) {
            console.error(err);
        }
    }

    // -------------------
    
 
    // Membership button and cashfree Payment
    membershipBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("http://localhost:3000/payment/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: 299 }),
            });
            const data = await res.json();
            if (!data?.cfOrder) return alert("Order not created");

            new cashfree.checkout({
                paymentSessionId: data.cfOrder.payment_session_id,
                redirectTarget: "_self",
                onSuccess: async () => {
                    alert("🎉 Payment Successful! You are now a Premium User.");
                    checkPremium(); 
                },
                onFailure: (err) => {
                    console.error(err);
                    alert("Payment Failed!");
                }
            });
        } catch (err) {
            console.error(err);
        }
    });

    async function checkPremium() {
        try {
            const res = await fetch("http://localhost:3000/user/me", {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (res.status === 200) {
                const { user } = await res.json();
                if (user?.isPremium === true) {
                    premiumMessage.style.display = "block";
                    showLeaderboardBtn.style.display = "inline-block";
                } else {
                    premiumMessage.style.display = "none";
                    showLeaderboardBtn.style.display = "none";
                }
            } else {
                premiumMessage.style.display = "none";
                showLeaderboardBtn.style.display = "none";
            }
        } catch (err) {
            console.error("Failed to fetch user info:", err);
            premiumMessage.style.display = "none";
            showLeaderboardBtn.style.display = "none";
        }
    }
    // Showing leaderboard to the premium user
    showLeaderboardBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("http://localhost:3000/expense/leaderboard", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.status === 200) {
                const { leaderboard } = await res.json();
                leaderboardBody.innerHTML = "";
                leaderboard.forEach((user, index) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${user.username}</td>
                        <td>${user.totalExpense || 0}</td>
                    `;
                    leaderboardBody.appendChild(tr);
                });
                leaderboardSection.style.display = "block";
            }
        } catch (err) {
            console.error(err);
        }
    });

    checkPremium();
    fetchExpenses();
});
