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

// SIGNUP FORM console output
signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };
    console.log("Sign Up Data:", JSON.stringify(data, null, 2));
});

    // LOGIN FORM console output
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
    };
    console.log("Login Data:", JSON.stringify(data, null, 2));
});