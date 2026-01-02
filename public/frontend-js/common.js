// Common Shared Values
const token = localStorage.getItem("token");
const cashfree = Cashfree({ mode: "sandbox" });
const BASE_URL = "http://localhost:3000"
if (!token) {
    alert("Please login first!");
    window.location.href = "/";
}
