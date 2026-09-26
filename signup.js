const API_URL =
    "/api/users";


// ==========================================
// SIGNUP
// ==========================================

const signupForm =
    document.getElementById(
        "signupForm"
    );


signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "signupPassword"
                )
                .value;


        const message =
            document.getElementById(
                "signupMessage"
            );


        message.textContent =
            "Creating account...";


        try {

            const response =
                await fetch(
                    API_URL + "/signup",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            name: name,

                            email: email,

                            phone: phone,

                            password: password

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Signup failed";

                message.className =
                    "message error";

                return;

            }


            message.textContent =
                "Account created successfully";

            message.className =
                "message success";


            signupForm.reset();


            // Go to login after 1 second

            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1000
            );


        } catch (error) {

            console.error(error);

            message.textContent =
                "Server error. Please try again.";

            message.className =
                "message error";

        }

    }
);


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

const showSignupPassword =
    document.getElementById(
        "showSignupPassword"
    );


showSignupPassword.addEventListener(
    "click",
    function () {

        const password =
            document.getElementById(
                "signupPassword"
            );


        if (
            password.type ===
            "password"
        ) {

            password.type =
                "text";

            showSignupPassword.textContent =
                "Hide";

        } else {

            password.type =
                "password";

            showSignupPassword.textContent =
                "Show";

        }

    }
);