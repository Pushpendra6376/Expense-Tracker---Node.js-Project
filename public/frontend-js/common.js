// Common Shared Values
const token = localStorage.getItem("token");
const BASE_URL = "http://localhost:3000";
const cashfree = Cashfree({ mode: "sandbox" });

if (!token) {
    alert("Please login first!");
    window.location.href = "/";
}
