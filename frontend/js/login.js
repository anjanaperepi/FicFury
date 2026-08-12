document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const data = {
            email: document
                .getElementById("email")
                .value
                .trim(),

            password: document
                .getElementById("password")
                .value
        };

        try {

            const response = await fetch(
                `${CONFIG.API_BASE_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            const result = await response.json();

            if (!response.ok || !result.token) {
                alert(result.message || "Login failed.");
                return;
            }

            // Store JWT Token

localStorage.setItem(CONFIG.TOKEN_KEY, result.token);
localStorage.setItem("role", result.role);
localStorage.setItem("fullName", result.fullName);
localStorage.setItem("committeeId", result.committeeId);
localStorage.setItem("userId",result.userId);


            // Store basic user information
localStorage.setItem(

    CONFIG.USER_KEY,

    JSON.stringify({

        id: result.userId,

        fullName: result.fullName,

        role: result.role

    })

);

            console.log("Login Successful");

            switch (result.role) {

                case "ADMIN":
                    window.location.href = "admin-dashboard.html";
                    break;

                case "CHAIR":
                    window.location.href = "chair-dashboard.html";
                    break;

                case "DELEGATE":
                    window.location.href = "dashboard.html";
                    break;

                default:
                    alert("Unknown user role.");
                    localStorage.clear();
                    break;
            }

        } catch (error) {

            console.error("Login Error:", error);

            alert("Unable to connect to the server.");
        }

    });