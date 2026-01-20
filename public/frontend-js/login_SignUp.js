const signUpForm = document.querySelector('.sign-up');
const loginForm = document.querySelector('.login');
const showSignUpBtn = document.getElementById('showSignUp');
const showLoginBtn = document.getElementById('showLogin');

/* ---------------- TOGGLE FORMS ---------------- */

showSignUpBtn.addEventListener('click', () => {
    signUpForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    showSignUpBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
});

showLoginBtn.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    signUpForm.classList.add('hidden');
    showLoginBtn.classList.add('active');
    showSignUpBtn.classList.remove('active');
});

/* ---------------- SIGNUP ---------------- */

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 🔴 Clear any old/expired token
    localStorage.removeItem("token");

    const data = {
        username: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    try {
        const res = await fetch(`/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log("Signup Response:", result);

        if (res.status === 201) {
            // ✅ SAVE TOKEN FROM BACKEND
            if (result.token) {
                localStorage.setItem("token", result.token);
            }

            showToast("Account created successfully!");

            setTimeout(() => {
                window.location.href = "/expense.html";
            }, 1500);
        } else {
            showToast(result.message || "Signup failed");
        }
    } catch (err) {
        console.error(err);
        showToast("Something went wrong!");
    }
});

/* ---------------- LOGIN ---------------- */

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
    };

    try {
        const res = await fetch(`/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log("Login Response:", result);

        if (res.status === 200) {
            // ✅ SAVE TOKEN
            localStorage.setItem("token", result.token);

            showToast("Logged in successfully!");

            setTimeout(() => {
                window.location.href = "/expense.html";
            }, 1500);
        } else {
            showToast(result.message || "Login failed");
        }
    } catch (err) {
        console.error(err);
        showToast("Something went wrong!");
    }
});

/* ---------------- FORGOT PASSWORD ---------------- */

function showForgotForm() {
    document.getElementById("forgot-form").style.display = "block";
}

async function forgotPassword() {
    const email = document.getElementById("forgotEmail").value;

    if (!email) {
        alert("Please enter your email");
        return;
    }

    try {
        const response = await axios.post(`/password/forgotpassword`, {
            email: email
        });

        alert(response.data.message);
    } catch (error) {
        console.error(error);
        alert("Something went wrong while sending reset mail!");
    }
}
