document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expenseForm");
    const expenseList = document.getElementById("expenseList");
    const pagination = document.getElementById("pagination");

    // Report Elements
    const reportMonthInput = document.getElementById("filter-month");
    const reportTableBody = document.getElementById("report-table-body");
    const reportTotalIncome = document.getElementById("report-total-income");
    const reportTotalExpense = document.getElementById("report-total-expense");
    const reportSavings = document.getElementById("report-savings");

    let currentPage = 1;
    let savedLimit = localStorage.getItem("expensesPerPage");
    const limitSelect = document.getElementById("expenses-per-page");
    let limit = savedLimit ? Number(savedLimit) : 5;
    limitSelect.value = limit;
    let lastPage = 1;

    // Set default month to current month
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (reportMonthInput) {
        reportMonthInput.value = currentMonthStr;
        reportMonthInput.addEventListener("change", loadReport);
    }

    limitSelect.addEventListener("change", () => {
        limit = Number(limitSelect.value);
        localStorage.setItem("expensesPerPage", limit);
        loadExpenses(1);
    });

    // --- Main Expense List Logic ---
    async function loadExpenses(page = 1) {
        try {
            const res = await fetch(
                `${BASE_URL}/expense?page=${page}&limit=${limit}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            const expenses = data.expenses;
            currentPage = data.currentPage;
            lastPage = data.lastPage;

            renderExpenseList(expenses);
            buildPagination();
            
            // Reload report whenever expenses change
            loadReport(); 

        } catch (err) {
            console.error("Error loading expenses:", err);
        }
    }

    // [UPDATED] Secure rendering to prevent XSS
    function renderExpenseList(expenses) {
        expenseList.innerHTML = ""; // Clear existing list
        
        expenses.forEach((exp) => {
            const li = document.createElement("li");

            // Create text content safely
            const textSpan = document.createElement("span");
            textSpan.textContent = `${exp.amount} - ${exp.description} - ${exp.category}`;

            // Create delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("del-btn");
            deleteBtn.dataset.id = exp.id;
            deleteBtn.addEventListener("click", () => deleteExpense(exp.id));

            li.appendChild(textSpan);
            li.appendChild(deleteBtn);
            expenseList.appendChild(li);
        });
    }

    // --- Pagination Logic ---
    function buildPagination() {
        pagination.innerHTML = "";
        if (currentPage > 1) pagination.appendChild(pageBtn("Prev", currentPage - 1));
        pagination.appendChild(pageBtn(1, 1, currentPage === 1));
        if (currentPage > 3) pagination.appendChild(dots());
        if (currentPage - 1 > 1) pagination.appendChild(pageBtn(currentPage - 1, currentPage - 1));
        if (currentPage !== 1 && currentPage !== lastPage) pagination.appendChild(pageBtn(currentPage, currentPage, true));
        if (currentPage + 1 < lastPage) pagination.appendChild(pageBtn(currentPage + 1, currentPage + 1));
        if (currentPage < lastPage - 2) pagination.appendChild(dots());
        if (lastPage > 1) pagination.appendChild(pageBtn(lastPage, lastPage, currentPage === lastPage));
        if (currentPage < lastPage) pagination.appendChild(pageBtn("Next", currentPage + 1));
    }

    function pageBtn(text, page, active = false) {
        const btn = document.createElement("button");
        btn.innerText = text;
        btn.className = active ? "active-page" : "page-btn";
        btn.addEventListener("click", () => loadExpenses(page));
        return btn;
    }

    function dots() {
        const d = document.createElement("span");
        d.innerText = "...";
        d.style.margin = "0 5px";
        return d;
    }

    //Report Generation Logic
    async function loadReport() {
        if (!reportTableBody) return;
        
        const selectedMonth = reportMonthInput.value;
        try {
            const res = await fetch(`/expense/report-data?month=${selectedMonth}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            
            if (res.status === 200) {
                renderReportTable(data.expenses);
            }
        } catch (err) {
            console.error("Error loading report:", err);
        }
    }

    function renderReportTable(expenses) {
        reportTableBody.innerHTML = "";
        let incomeTotal = 0;
        let expenseTotal = 0;

        expenses.forEach(exp => {
            const date = new Date(exp.createdAt).toLocaleDateString();
            const isIncome = ["salary", "income"].includes(exp.category.toLowerCase());
            
            if (isIncome) {
                incomeTotal += Number(exp.amount); // Ensure number addition
            } else {
                expenseTotal += Number(exp.amount);
            }

            // Using textContent for cells where possible or careful construction
            const row = document.createElement("tr");
            
            const dateCell = document.createElement("td");
            dateCell.textContent = date;
            
            const descCell = document.createElement("td");
            descCell.textContent = exp.description;
            
            const catCell = document.createElement("td");
            catCell.textContent = exp.category;
            
            const incomeCell = document.createElement("td");
            incomeCell.textContent = isIncome ? exp.amount : "";
            
            const expenseCell = document.createElement("td");
            expenseCell.textContent = !isIncome ? exp.amount : "";

            row.append(dateCell, descCell, catCell, incomeCell, expenseCell);
            reportTableBody.appendChild(row);
        });

        reportTotalIncome.innerText = incomeTotal.toFixed(2);
        reportTotalExpense.innerText = expenseTotal.toFixed(2);
        reportSavings.innerText = `₹ ${(incomeTotal - expenseTotal).toFixed(2)}`;
    }

    // --- Add/Delete Logic ---
    expenseForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            amount: document.getElementById("amount").value,
            description: document.getElementById("description").value,
            category: document.getElementById("category").value,
            note: document.getElementById("note").value
        };

        try {
            const res = await fetch(`/expense`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(data),
            });
            if (res.status === 201) {
                expenseForm.reset();
                loadExpenses(1);
            } else {
                alert("Failed to add expense");
            }
        } catch (err) {
            console.error(err);
        }
    });

    async function deleteExpense(id) {
        try {
            const res = await fetch(`/expense/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) {
                loadExpenses(currentPage);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Initial Load
    loadExpenses(1);
    if(reportMonthInput) loadReport();
});