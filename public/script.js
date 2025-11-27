// Toggle between Sign Up and Login forms
const signUpForm = document.querySelector('.sign-up');
const loginForm = document.querySelector('.login');
const showSignUpBtn = document.getElementById('showSignUp');
const showLoginBtn = document.getElementById('showLogin');

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

// sending new user data to the backend
signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        username: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    console.log("Sign Up Data:", JSON.stringify(data, null, 2));

    try {
        const res = await fetch("http://localhost:3000/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log(result);

        if (res.status === 201) {
            alert("User created successfully!");
            window.location.href = "/expense.html"; 
        } else {
            alert(result.message || "Signup failed");
        }
    } catch (err) {
        console.log(err);
        alert("Something went wrong!");
    }
});

// login for existing user 
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
    };

    console.log("Login Data:", JSON.stringify(data, null, 2));

    try {
        const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log(result);

        if (res.status === 200) {
             localStorage.setItem("token", result.token);
            alert("Login successful!");
            window.location.href = "/expense.html"; 
        } else {
            alert(result.message || "Login failed");
        }
    } catch (err) {
        console.log(err);
        alert("Something went wrong!");
    }
});
