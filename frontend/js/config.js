// ============================================================
// FIC FURY - API CONFIGURATION
// Automatically switches between local and deployed backend.
// ============================================================

const isLocalDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const CONFIG = {

    API_BASE_URL: isLocalDevelopment
        ? "http://localhost:8080/api"
        : "https://ficfury.onrender.com/api",

    TOKEN_KEY:
        "ficfury_token",

    USER_KEY:
        "ficfury_user"

};