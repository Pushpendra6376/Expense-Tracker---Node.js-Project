// Common Shared Values
const token = localStorage.getItem("token");
const cashfree = Cashfree({ mode: "sandbox" });

if (!token) {
    alert("Please login first!");
    window.location.href = "/";
}
