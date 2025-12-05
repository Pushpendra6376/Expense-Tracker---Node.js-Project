document.addEventListener("DOMContentLoaded", () => {

    const membershipBtn = document.querySelector(".membership button");
    const showLeaderboardBtn = document.getElementById("show-leaderboard");
    const leaderboardSection = document.getElementById("leaderboard-section");
    const leaderboardBody = document.getElementById("leaderboard-body");
    const premiumMessage = document.getElementById("premium-message");

    // -------------------
    // Premium Check
    async function checkPremium() {
        try {
            const res = await fetch(`${BASE_URL}/user/me`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (res.status === 200) {
                const { user } = await res.json();

                if (user?.isPremium) {
                    premiumMessage.style.display = "block";
                    showLeaderboardBtn.style.display = "inline-block";
                } else {
                    premiumMessage.style.display = "none";
                    showLeaderboardBtn.style.display = "none";
                }
            }
        } catch (err) {
            console.error("Failed to fetch user info:", err);
        }
    }

    // Membership Purchase
    membershipBtn.addEventListener("click", async () => {
        try {
            const res = await fetch(`${BASE_URL}/payment/order`, {
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

    // Show Leaderboard
    showLeaderboardBtn.addEventListener("click", async () => {
        try {
            const res = await fetch(`${BASE_URL}/expense/leaderboard`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (res.status === 200) {
                const { leaderboard } = await res.json();

                let html = "";
                leaderboard.forEach((user, index) => {
                    html += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${user.username}</td>
                            <td>${user.TotalExpense?.totalExpense || 0}</td>
                        </tr>
                    `;
                });

                leaderboardBody.innerHTML = html;
                leaderboardSection.style.display = "block";
            }
        } catch (err) {
            console.error(err);
        }
    });


    checkPremium();
});
