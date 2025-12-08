document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expenseForm");
    const expenseList = document.getElementById("expenseList");
    const downloadBtn = document.getElementById("download-expense-btn");
    const pagination = document.getElementById("pagination");

    let currentPage = 1;
    let savedLimit = localStorage.getItem("expensesPerPage");
    const limitSelect = document.getElementById("expenses-per-page");
    let limit = savedLimit ? Number(savedLimit) : 5;
    limitSelect.value = limit;  
    let lastPage = 1;

    let allExpenses = []; // this array is For report generation only

    limitSelect.addEventListener("change", () => {
      limit = Number(limitSelect.value);
      localStorage.setItem("expensesPerPage", limit);
      loadExpenses(1); // reload page 1 with new limit
  });
    //loading expense with our pagination
    async function loadExpenses(page = 1) {
        try {
            const res = await fetch(
                `${BASE_URL}/expense?page=${page}&limit=${limit}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json();

            const expenses = data.expenses;
            currentPage = data.currentPage;
            lastPage = data.lastPage;

  
            await fetchAllExpenses();

            renderExpenseList(expenses);

            buildPagination();

        } catch (err) {
            console.error("Error loading expenses:", err);
        }
    }

    async function fetchAllExpenses() {
        try {
            const res = await fetch(`${BASE_URL}/expense?limit=5000`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            allExpenses = data.expenses;
            updateReport();

        } catch (e) {
            console.log("Error fetching all:", e);
        }
    }

    function renderExpenseList(expenses) {
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

        document.querySelectorAll(".del-btn").forEach((btn) => {
            btn.addEventListener("click", () => deleteExpense(btn.dataset.id));
        });
    }

    //  PAGINATION PART 
    function buildPagination() {
        pagination.innerHTML = "";

        //prev button to go on prevoius page 
        if (currentPage > 1) {
            pagination.appendChild(
                pageBtn("Prev", currentPage - 1)
            );
        }

        // this is the page 1
        pagination.appendChild(pageBtn(1, 1, currentPage === 1));

        // when we go to more than 3 pages then it will the pages into dots 
        if (currentPage > 3) {
            pagination.appendChild(dots());
        }

        // ye jo apna current page hoga uska ek pehle ka like if we are in 6th page this will we our 5th page
        if (currentPage - 1 > 1) {
            pagination.appendChild(pageBtn(currentPage - 1, currentPage - 1));
        }

        // ye apna Current page
        if (currentPage !== 1 && currentPage !== lastPage) {
            pagination.appendChild(pageBtn(currentPage, currentPage, true));
        }

        // ye current ke aage ka page like if we  are in 6th so this onw will be 7th
        if (currentPage + 1 < lastPage) {
            pagination.appendChild(pageBtn(currentPage + 1, currentPage + 1));
        }

        // Right dots (...)
        if (currentPage < lastPage - 2) {
            pagination.appendChild(dots());
        }

        // Last page
        if (lastPage > 1) {
            pagination.appendChild(
                pageBtn(lastPage, lastPage, currentPage === lastPage)
            );
        }

        // Next button
        if (currentPage < lastPage) {
            pagination.appendChild(
                pageBtn("Next", currentPage + 1)
            );
        }
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

    
    // ADD EXPENSE
   
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
                loadExpenses(1); // iska kaam sirf ye hai ki agar hum koi bhi expense add krte hai toh ye page 1 pe aajaega apan kisi bhi page pe ho 
            } else {
                alert("Failed to add expense");
            }
        } catch (err) {
            console.error(err);
        }
    });


    // DELETE EXPENSE
    async function deleteExpense(id) {
        try {
            const res = await fetch(`${BASE_URL}/expense/delete/${id}`, {
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

    // REPORT TABLE

    function updateReport() {
        const filterType = document.getElementById("filter-type");
        const filterMonth = document.getElementById("filter-month");
        const reportBody = document.getElementById("report-table-body");

        const type = filterType.value;
        const selected = new Date(filterMonth.value);

        reportBody.innerHTML = "";

        let totalIncome = 0;
        let totalExpense = 0;

        const filtered = allExpenses.filter((exp) => {
            const d = new Date(exp.createdAt);
            return (
                d.getFullYear() === selected.getFullYear() &&
                d.getMonth() === selected.getMonth()
            );
        });

        filtered.forEach((exp) => {
            const isIncome = exp.category.toLowerCase() === "income" ||
                             exp.category.toLowerCase() === "salary";

            const amt = parseFloat(exp.amount);

            if (isIncome) totalIncome += amt;
            else totalExpense += amt;

            reportBody.innerHTML += `
                <tr>
                    <td>${exp.createdAt.split("T")[0]}</td>
                    <td>${exp.description}</td>
                    <td>${exp.category}</td>
                    <td>${isIncome ? amt : ""}</td>
                    <td>${!isIncome ? amt : ""}</td>
                </tr>
            `;
        });

        document.getElementById("report-total-income").innerText = totalIncome.toFixed(2);
        document.getElementById("report-total-expense").innerText = totalExpense.toFixed(2);

        let savings = totalIncome - totalExpense;
        document.getElementById("report-savings").innerText = `₹ ${savings.toFixed(2)}`;
    }

    // to download the report for offline access
    downloadBtn.addEventListener("click", () => {
        if (allExpenses.length === 0) {
            alert("No expenses found!");
            return;
        }

        let csv = "Date,Description,Category,Income,Expense\n";

        allExpenses.forEach((exp) => {
            const isIncome =
                exp.category.toLowerCase() === "income" ||
                exp.category.toLowerCase() === "salary";

            csv += `${exp.createdAt.split("T")[0]},${exp.description},${exp.category},${
                isIncome ? exp.amount : ""
            },${!isIncome ? exp.amount : ""}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "expenses_report.csv";
        a.click();
        URL.revokeObjectURL(url);
    });

    loadExpenses(1);
});
