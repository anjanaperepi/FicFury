/* ==========================================================
   FIC FURY — LOGIN
   ========================================================== */

document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ==================================================
               FORM DATA
            ================================================== */

            const data = {

                email:
                    document
                        .getElementById("email")
                        .value
                        .trim(),

                password:
                    document
                        .getElementById("password")
                        .value

            };


            /* ==================================================
               BASIC VALIDATION
            ================================================== */

            if (!data.email || !data.password) {

                FuryToast.warning(
                    "Please enter your email and password."
                );

                return;

            }


            /* ==================================================
               SUBMIT
            ================================================== */

            try {

                const response =
                    await fetch(
                        `${CONFIG.API_BASE_URL}/auth/login`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)

                        }
                    );


/* ==================================================
   READ SERVER RESPONSE SAFELY
================================================== */

let result = {};

const responseText =
    await response.text();


if (responseText.trim()) {

    try {

        result =
            JSON.parse(responseText);

    } catch (parseError) {

        console.warn(
            "Server returned a non-JSON response:",
            responseText
        );

    }

}


/* ==================================================
   LOGIN FAILURE
================================================== */

if (!response.ok || !result.token) {

    if (response.status === 401) {

        FuryToast.error(
            result.message ||
            "Incorrect email or password."
        );

    } else if (response.status === 403) {

        /*
         * Your current backend is returning 403
         * for this failed login attempt.
         */

        FuryToast.error(
            result.message ||
            "Incorrect email or password."
        );

    } else {

        FuryToast.error(
            result.message ||
            "Login failed. Please try again."
        );

    }

    return;

}



                /* ==================================================
                   STORE JWT TOKEN
                ================================================== */

                localStorage.setItem(
                    CONFIG.TOKEN_KEY,
                    result.token
                );


                localStorage.setItem(
                    "role",
                    result.role
                );


                localStorage.setItem(
                    "fullName",
                    result.fullName
                );


                localStorage.setItem(
                    "committeeId",
                    result.committeeId
                );


                localStorage.setItem(
                    "userId",
                    result.userId
                );


                /* ==================================================
                   STORE BASIC USER INFORMATION
                ================================================== */

                localStorage.setItem(
                    CONFIG.USER_KEY,
                    JSON.stringify({

                        id:
                            result.userId,

                        fullName:
                            result.fullName,

                        role:
                            result.role

                    })
                );


                console.log(
                    "Login Successful"
                );


                /* ==================================================
                   SUCCESS TOAST
                ================================================== */

                FuryToast.success(
                    `Welcome back, ${result.fullName || "Delegate"}!`
                );


                /* ==================================================
                   ROLE REDIRECT
                ================================================== */

                /*
                 * Give the toast a moment to appear before
                 * navigating away.
                 */

                setTimeout(() => {

                    switch (result.role) {

                        case "ADMIN":

                            window.location.href =
                                "admin-dashboard.html";

                            break;


                        case "CHAIR":

                            window.location.href =
                                "chair-dashboard.html";

                            break;


                        case "DELEGATE":

                            window.location.href =
                                "dashboard.html";

                            break;


                        default:

                            FuryToast.error(
                                "Unknown user role. Please contact an administrator."
                            );


                            localStorage.clear();

                            break;

                    }

                }, 500);

            }


            /* ==================================================
               NETWORK / SERVER ERROR
            ================================================== */

            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                FuryToast.error(
                    "Unable to connect to FIC FURY. Please try again."
                );

            }

        }
    );