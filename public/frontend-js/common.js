// Common Shared Values
const token = localStorage.getItem("token");
const BASE_URL = process.env.BASE_URL;
const cashfree = Cashfree({ mode: "sandbox" });

if (!token) {
    alert("Please login first!");
    window.location.href = "/";
}
