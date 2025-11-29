document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expenseForm");
    const expenseList = document.getElementById("expenseList");

    // Get Bearer token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first!");
        window.location.href = "/";
        return; // if the token not found then stop execution
    }

    // Fetch and display all expenses on page load
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

            const resData = await res.json();
            const expenses = resData.expenses;
            expenseList.innerHTML = ""; // Clear list before rendering

            expenses.forEach(exp => {
                const li = document.createElement("li");
                li.innerHTML = `
                    ${exp.amount} - ${exp.description} - ${exp.category}
                    <button data-id="${exp.id}">Delete</button>
                `;
                expenseList.appendChild(li);

                // Delete button event
                li.querySelector("button").addEventListener("click", async () => {
                    await deleteExpense(exp.id);
                });
            });
        } catch (err) {
            console.error(err);
            alert("Failed to fetch expenses");
        }
    }

    // Add new expense from our expense.html
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
                fetchExpenses(); // Refresh list
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

    // Initial fetch
    fetchExpenses();
});
