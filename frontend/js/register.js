document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");

    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    const strength = document.getElementById("passwordStrength");
    const match = document.getElementById("passwordMatch");

    const button = document.getElementById("registerBtn");

    document.querySelectorAll(".toggle-password").forEach(btn => {

        btn.addEventListener("click", () => {

            const input = btn.previousElementSibling;

            input.type =
                input.type === "password"
                    ? "text"
                    : "password";

            btn.innerHTML =
                input.type === "password"
                    ? '<i class="fa-solid fa-eye"></i>'
                    : '<i class="fa-solid fa-eye-slash"></i>';

        });

    });

    password.addEventListener("input", () => {

        const value = password.value;

        let score = 0;

        if(value.length >= 8) score++;
        if(/[A-Z]/.test(value)) score++;
        if(/[0-9]/.test(value)) score++;
        if(/[^A-Za-z0-9]/.test(value)) score++;

        if(score <= 1){

            strength.textContent = "Weak Password";
            strength.style.color = "#E53935";

        }
        else if(score <=3){

            strength.textContent = "Medium Password";
            strength.style.color = "#F59E0B";

        }
        else{

            strength.textContent = "Strong Password";
            strength.style.color = "#16A34A";

        }

    });

    confirmPassword.addEventListener("input", () => {

        if(confirmPassword.value === ""){

            match.textContent = "";
            return;

        }

        if(password.value === confirmPassword.value){

            match.textContent = "✔ Passwords match";
            match.style.color = "#16A34A";

        }
        else{

            match.textContent = "✖ Passwords do not match";
            match.style.color = "#E53935";

        }

    });

    form.addEventListener("submit", async e => {

        e.preventDefault();

        if(password.value !== confirmPassword.value){

           FuryToast.error(
    "Passwords do not match."
);
            return;

        }

        button.disabled = true;
        button.innerHTML = "Creating Account...";

        const data = {

            fullName: document.getElementById("fullName").value,
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            password: password.value

        };

        try{

            const result = await apiRequest(
                "/auth/register",
                "POST",
                data
            );

FuryToast.success(
    result?.message || "Registration successful!"
);
            setTimeout(() => {

                window.location.href = "login.html";

            },1500);

        }
catch(error){

    console.error(error);

    FuryToast.error(
        error?.message ||
        "Registration failed. Please try again."
    );

}
        finally{

            button.disabled = false;
            button.innerHTML = "⚡ CREATE ACCOUNT";

        }

    });

});