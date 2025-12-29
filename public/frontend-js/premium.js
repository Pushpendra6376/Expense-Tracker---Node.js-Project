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
            const res = await fetch(`/user/me`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (res.status === 200) {
                const { user } = await res.json();
                
                // Get the new Download Button
                const downloadBtn = document.getElementById("download-expense-btn");

                if (user?.isPremium) {
                    // Show existing premium UI
                    premiumMessage.style.display = "block";
                    showLeaderboardBtn.style.display = "inline-block";
                    
                    // --- NEW: Enable Download Button ---
                    if(downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.innerHTML = "Download Report 📥";
                        downloadBtn.title = "Download your expenses";
                    }
                } else {
                    // Hide/Disable premium UI
                    premiumMessage.style.display = "none";
                    showLeaderboardBtn.style.display = "none";
                    
                    // --- NEW: Disable Download Button ---
                    if(downloadBtn) {
                        downloadBtn.disabled = true;
                        downloadBtn.innerHTML = "Download Report 🔒";
                        downloadBtn.title = "Upgrade to Premium to download";
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch user info:", err);
        }
    }

    // Membership Purchase
    membershipBtn.addEventListener("click", async () => {
        try {
            const res = await fetch(`/payment/order`, {
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
            const res = await fetch(`/expense/leaderboard`, {
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
