
const signUpForm = document.querySelector('.sign-up');
const loginForm = document.querySelector('.login');
const showSignUpBtn = document.getElementById('showSignUp');
const showLoginBtn = document.getElementById('showLogin');
const BASE_URL = "http://13.203.205.165/";
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


signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        username: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    try {
        const res = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log(result);

        if (res.status === 201) {
            showToast("Account created successfully!");
            setTimeout(() => {
                window.location.href = "/expense.html";
            }, 1500);
        } else {
            showToast(result.message || "Signup failed");
        }
    } catch (err) {
        console.log(err);
        showToast("Something went wrong!");
    }
});


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
    };

    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log(result);

        if (res.status === 200) {
            localStorage.setItem("token", result.token);

            showToast("Logged in successfully!");

            setTimeout(() => {
                window.location.href = "/expense.html";
            }, 1500);

        } else {
            showToast(result.message || "Login failed");
        }
    } catch (err) {
        console.log(err);
        showToast("Something went wrong!");
    }
});


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
        const response = await axios.post(`${BASE_URL}/password/forgotpassword`, {
            email: email
        });

        alert(response.data.message);
    } catch (error) {
        console.log(error);
        alert("Something went wrong while sending reset mail!");
    }
}
