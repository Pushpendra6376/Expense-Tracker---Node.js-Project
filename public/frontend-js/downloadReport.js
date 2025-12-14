document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("download-expense-btn");

    if (!downloadBtn) return;

    downloadBtn.addEventListener("click", async () => {
        try {
            const res = await fetch(`${BASE_URL}/report/download`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                alert("Upgrade to premium to download report");
                return;
            }

            if (!res.ok) {
                alert("Download failed");
                return;
            }

            const data = await res.json();

            if (data.fileUrl) {
                window.location.href = data.fileUrl;
            }

        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    });
});
