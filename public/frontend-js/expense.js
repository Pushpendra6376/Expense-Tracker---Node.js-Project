document.addEventListener("DOMContentLoaded", () => {
  const expenseForm = document.getElementById("expenseForm");
  const expenseList = document.getElementById("expenseList");
  const downloadBtn = document.getElementById("download-expense-btn");

  let allExpenses = [];
  // Fetch expenses
  async function fetchExpenses() {
    try {
      const res = await fetch(`${BASE_URL}/expense/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        const { expenses } = await res.json();
        allExpenses = expenses;
        renderExpenseList();
        updateReport();
        let html = "";
        expenses.forEach((exp) => {
          html += `
                        <li>
                            ${exp.amount} - ${exp.description} - ${exp.category}
                            <button data-id="${exp.id}" class="del-btn">Delete</button>
                        </li>
                    `;
        });
        expenseList.innerHTML = html;

        // Event delegation for delete buttons
        document.querySelectorAll(".del-btn").forEach((btn) => {
          btn.addEventListener("click", () => deleteExpense(btn.dataset.id));
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
          Authorization: `Bearer ${token}`,
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  }

  function renderExpenseList() {
    let html = "";
    allExpenses.forEach((exp) => {
      html += `
            <li>
                ${exp.amount} - ${exp.description} - ${exp.category}
                <button data-id="${exp.id}" class="del-btn">Delete</button>
            </li>
        `;
    });
    expenseList.innerHTML = html;

    // Delete button events
    document.querySelectorAll(".del-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteExpense(btn.dataset.id));
    });
  }
  const filterType = document.getElementById("filter-type");
  const filterMonth = document.getElementById("filter-month");
  const reportBody = document.getElementById("report-table-body");

  filterType.addEventListener("change", updateReport);
  filterMonth.addEventListener("change", updateReport);

  function updateReport() {
    const type = filterType.value; // daily / weekly / monthly
    const selectedDate = new Date(filterMonth.value || new Date());

    reportBody.innerHTML = "";

    let totalIncome = 0;
    let totalExpense = 0;

    const filteredExpenses = allExpenses.filter((exp) => {
      const expDate = new Date(exp.createdAt);
      return (
        expDate.getMonth() === selectedDate.getMonth() &&
        expDate.getFullYear() === selectedDate.getFullYear()
      );
    });

    filteredExpenses.forEach((exp) => {
      const isIncome =
        exp.category.toLowerCase() === "income" ||
        exp.category.toLowerCase() === "salary";

      const amount = parseFloat(exp.amount);

      if (isIncome) totalIncome += amount;
      else totalExpense += amount;

      const row = `
            <tr>
                <td>${exp.createdAt.split("T")[0]}</td>
                <td>${exp.description}</td>
                <td>${exp.category}</td>
                <td>${isIncome ? amount : ""}</td>
                <td>${!isIncome ? amount : ""}</td>
            </tr>
        `;
      reportBody.innerHTML += row;
    });

    document.getElementById("report-total-income").innerText =
      totalIncome.toFixed(2);
    document.getElementById("report-total-expense").innerText =
      totalExpense.toFixed(2);

    const savings = totalIncome - totalExpense;
    const savingsElem = document.getElementById("report-savings");
    savingsElem.innerText = `₹ ${savings.toFixed(2)}`;
    savingsElem.style.color = savings >= 0 ? "#48bb78" : "#e53e3e";
  }

  downloadBtn.addEventListener("click", () => {
    if (allExpenses.length === 0) {
      alert("No expenses to download!");
      return;
    }

    let csvContent = "Date,Description,Category,Income,Expense\n";

    allExpenses.forEach((exp) => {
      const isIncome =
        exp.category.toLowerCase() === "income" ||
        exp.category.toLowerCase() === "salary";
      const income = isIncome ? exp.amount : "";
      const expense = !isIncome ? exp.amount : "";
      csvContent += `${exp.createdAt.split("T")[0]},${exp.description},${
        exp.category
      },${income},${expense}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expense_report.csv";
    a.click();

    URL.revokeObjectURL(url);
  });
  fetchExpenses();
});
