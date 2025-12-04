document.addEventListener("DOMContentLoaded", () => {

    const expenseForm = document.getElementById("expenseForm");
    const expenseList = document.getElementById("expenseList");

    // -------------------
    // Fetch expenses
    async function fetchExpenses() {
        try {
            const res = await fetch(`${BASE_URL}/expense/`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (res.status === 200) {
                const { expenses } = await res.json();

                let html = "";
                expenses.forEach(exp => {
                    html += `
                        <li>
                            ${exp.amount} - ${exp.description} - ${exp.category}
                            <button data-id="${exp.id}" class="del-btn">Delete</button>
                        </li>
                    `;
                });
                expenseList.innerHTML = html;

                // Event delegation for delete buttons
                document.querySelectorAll(".del-btn").forEach(btn => {
                    btn.addEventListener("click", () =>
                        deleteExpense(btn.dataset.id)
                    );
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    // -------------------
    // Add Expense
    expenseForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            amount: document.getElementById("amount").value,
            description: document.getElementById("description").value,
            category: document.getElementById("category").value,
        };

        try {
            const res = await fetch(`${BASE_URL}/expense`, {
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
    // Delete Expense
    async function deleteExpense(id) {
        try {
            const res = await fetch(`${BASE_URL}/expense/delete/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (res.status === 200) fetchExpenses();

        } catch (err) {
            console.error(err);
        }
    }

    fetchExpenses();
});
