// Common Shared Values
const token = localStorage.getItem("token");
const BASE_URL = "http://13.203.205.165/";
const cashfree = Cashfree({ mode: "sandbox" });

if (!token) {
    alert("Please login first!");
    window.location.href = "/";
}
