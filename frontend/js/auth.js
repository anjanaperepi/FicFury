const Auth = {

async register(user){

const result =
await apiRequest(
"/auth/register",
"POST",
user
);

return result;

},

async login(email,password){

const result =
await apiRequest(
"/auth/login",
"POST",
{
email,
password
}
);

if(result.token){

localStorage.setItem(
CONFIG.TOKEN_KEY,
result.token
);

localStorage.setItem(
CONFIG.USER_KEY,
JSON.stringify(result.user)
);

}

return result;

},

logout(){

localStorage.removeItem(
CONFIG.TOKEN_KEY
);

localStorage.removeItem(
CONFIG.USER_KEY
);

window.location.href =
"login.html";

},

isLoggedIn(){

    return (
        localStorage.getItem(
            CONFIG.TOKEN_KEY
        ) !== null
    );

},
getCurrentUser() {

    const user = localStorage.getItem(
        CONFIG.USER_KEY
    );

    return user
        ? JSON.parse(user)
        : null;

}


};
// ===================================
// Authentication Utilities
// ===================================

function getToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
}

function getCurrentUser() {
    const user = localStorage.getItem(CONFIG.USER_KEY);

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}

function isLoggedIn() {
    return !!getToken();
}

function requireLogin() {

    if (!isLoggedIn()) {

        alert("Please login first.");

        window.location.href = "login.html";
    }

}

function redirectIfLoggedIn() {

    if (!isLoggedIn()) {
        return;
    }

    const user = getCurrentUser();

    if (!user) {
        logout();
        return;
    }

    switch (user.role) {

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
            logout();
    }

}

function logout() {

    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);

    window.location.href = "login.html";

}