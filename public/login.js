const API_URL =
    "http://localhost:3000/api/users";


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const emailOrPhone =
            document
                .getElementById("emailOrPhone")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        const message =
            document.getElementById("message");


        try {

            const response =
                await fetch(
                    API_URL + "/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            emailOrPhone:
                                emailOrPhone,

                            password:
                                password

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Login failed";

                message.className =
                    "error";

                return;
            }


            // ==========================================
            // SAVE TOKEN
            // ==========================================

            localStorage.setItem(
                "token",
                data.token
            );


            // ==========================================
            // SAVE USER
            // ==========================================

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            // ==========================================
            // LOGIN SUCCESS
            // ==========================================

            message.textContent =
                "Login Successfull";

            message.className =
                "success";


            // ==========================================
            // OPEN CHAT PAGE
            // ==========================================

            setTimeout(function () {

                window.location.href =
                    "chat.html";

            }, 500);


        } catch (error) {

            console.error(error);

            message.textContent =
                "Server error";

            message.className =
                "error";

        }

    }
);


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

document
    .getElementById("showPassword")
    .addEventListener(
        "click",
        function () {

            const password =
                document.getElementById("password");


            if (password.type === "password") {

                password.type = "text";

                this.textContent =
                    "Hide";

            } else {

                password.type = "password";

                this.textContent =
                    "Show";

            }

        }
    );