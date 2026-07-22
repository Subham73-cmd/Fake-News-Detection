/*
=================================
API URLS
=================================
*/

const LOGIN_API =
    "http://localhost:8080/api/auth/login";

const REGISTER_API =
    "http://localhost:8080/api/auth/register";

/*
=================================
PASSWORD TOGGLE
=================================
*/

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const passwordField =
                document.getElementById(
                    "password"
                );

            if (
                passwordField.type ===
                "password"
            ) {

                passwordField.type =
                    "text";

                togglePassword.innerHTML =
                    "🙈";

            } else {

                passwordField.type =
                    "password";

                togglePassword.innerHTML =
                    "👁️";
            }
        }
    );
}

/*
=================================
PASSWORD STRENGTH
=================================
*/

const passwordInput =
    document.getElementById(
        "password"
    );

if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        () => {

            const password =
                passwordInput.value;

            const strengthBar =
                document.getElementById(
                    "strengthBar"
                );

            const strengthText =
                document.getElementById(
                    "strengthText"
                );

            if (
                !strengthBar ||
                !strengthText
            ) return;

            let score = 0;

            if (
                password.length >= 8
            ) score++;

            if (
                /[A-Z]/.test(password)
            ) score++;

            if (
                /[0-9]/.test(password)
            ) score++;

            if (
                /[^A-Za-z0-9]/.test(
                    password
                )
            ) score++;

            switch(score){

                case 1:
                    strengthBar.style.width =
                        "25%";

                    strengthBar.style.background =
                        "#ef4444";

                    strengthText.innerHTML =
                        "Weak";

                    break;

                case 2:
                    strengthBar.style.width =
                        "50%";

                    strengthBar.style.background =
                        "#f59e0b";

                    strengthText.innerHTML =
                        "Medium";

                    break;

                case 3:
                    strengthBar.style.width =
                        "75%";

                    strengthBar.style.background =
                        "#3b82f6";

                    strengthText.innerHTML =
                        "Good";

                    break;

                case 4:
                    strengthBar.style.width =
                        "100%";

                    strengthBar.style.background =
                        "#22c55e";

                    strengthText.innerHTML =
                        "Strong";

                    break;

                default:
                    strengthBar.style.width =
                        "0%";

                    strengthText.innerHTML =
                        "Password Strength";
            }
        }
    );
}

/*
=================================
REGISTER
=================================
*/

const registerForm =
    document.getElementById(
        "registerForm"
    );

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const name =
                document.getElementById(
                    "name"
                ).value;

            const email =
                document.getElementById(
                    "email"
                ).value;

            const password =
                document.getElementById(
                    "password"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;

            const message =
                document.getElementById(
                    "message"
                );

            if (
                password !==
                confirmPassword
            ) {

                message.innerHTML =
                    "Passwords do not match";

                return;
            }

            try {

                const response =
                    await fetch(
                        REGISTER_API,
                        {

                        method:"POST",

                        headers:{
                            "Content-Type":
                            "application/json"
                        },

                        body:JSON.stringify({

                            name:name,
                            email:email,
                            password:password

                        })

                    });

                const data =
                    await response.json();

                message.innerHTML =
                    "Registration Successful";

                setTimeout(() => {

                    window.location.href =
                        "login.html";

                },1500);

            } catch(error){

                console.error(error);

                message.innerHTML =
                    "Registration Failed";
            }
        }
    );
}

/*
=================================
LOGIN
=================================
*/

const loginForm =
    document.getElementById(
        "loginForm"
    );

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const email =
                document.getElementById(
                    "email"
                ).value;

            const password =
                document.getElementById(
                    "password"
                ).value;

            const message =
                document.getElementById(
                    "message"
                );

            try {

                const response =
                    await fetch(
                        LOGIN_API,
                        {

                        method:"POST",

                        headers:{
                            "Content-Type":
                            "application/json"
                        },

                        body:JSON.stringify({

                            email:email,
                            password:password

                        })

                    });

                const data =
                    await response.json();

                if(data.token){

                    localStorage.setItem(
                        "token",
                        data.token
                    );

                    localStorage.setItem(
                        "userEmail",
                        email
                    );

                    message.innerHTML =
                        "Login Successful";

                    setTimeout(() => {

                        window.location.href =
                            "dashboard.html";

                    },1000);

                }else{

                    message.innerHTML =
                        "Invalid Credentials";
                }

            } catch(error){

                console.error(error);

                message.innerHTML =
                    "Login Failed";
            }
        }
    );
}

/*
=================================
LOGOUT
=================================
*/

function logout(){

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "userEmail"
    );

    window.location.href =
        "login.html";
}

/*
=================================
JWT CHECK
=================================
*/

function checkAuth(){

    const token =
        localStorage.getItem(
            "token"
        );

    if(!token){

        window.location.href =
            "login.html";
    }
}