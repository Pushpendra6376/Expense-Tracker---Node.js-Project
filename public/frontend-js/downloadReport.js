document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("report-table-body");
    const totalIncomeEl = document.getElementById("report-total-income");
    const totalExpenseEl = document.getElementById("report-total-expense");
    const savingsEl = document.getElementById("report-savings");
    const downloadBtn = document.getElementById("download-expense-btn");

    const filterType = document.getElementById("filter-type");
    const filterMonth = document.getElementById("filter-month");

   
    // Load report data
    async function loadReport() {
        try {
            const res = await fetch(
                `/report/summary?limit=15&type=${filterType.value}&month=${filterMonth.value}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                alert("Failed to load report");
                return;
            }

            const data = await res.json();

            tableBody.innerHTML = "";

            let totalIncome = 0;
            let totalExpense = 0;

            data.latestExpenses.forEach(exp => {
                const category = exp.category.toLowerCase();
                const isIncome = category === "income" || category === "salary";

                if (isIncome) totalIncome += Number(exp.amount);
                else totalExpense += Number(exp.amount);

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${exp.createdAt.split("T")[0]}</td>
                    <td>${exp.description || "-"}</td>
                    <td>${exp.category}</td>
                    <td>${isIncome ? exp.amount : "-"}</td>
                    <td>${!isIncome ? exp.amount : "-"}</td>
                `;
                tableBody.appendChild(tr);
            });

            totalIncomeEl.textContent = totalIncome.toFixed(2);
            totalExpenseEl.textContent = totalExpense.toFixed(2);
            savingsEl.textContent = `₹ ${(totalIncome - totalExpense).toFixed(2)}`;

        } catch (err) {
            console.error(err);
            alert("Something went wrong while loading report");
        }
    }

    // Download Report
    downloadBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("/report/download", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                alert("Upgrade to premium to download report");
                return;
            }

            const data = await res.json();
            if (data.fileUrl) {
                window.location.href = data.fileUrl;
            }

        } catch (err) {
            alert("Download failed");
        }
    });

 
    if (localStorage.getItem("isPremium") === "true") {
        downloadBtn.disabled = false;
        downloadBtn.textContent = "Download Report";
    }

    filterType.addEventListener("change", loadReport);
    filterMonth.addEventListener("change", loadReport);

    // Initial load
    loadReport();
});
