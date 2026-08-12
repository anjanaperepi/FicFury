/**
 * =====================================================
 * UI Utilities
 * =====================================================
 */

function showToast(message, type = "success") {

    let toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    toast.innerHTML = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        },300);

    },3000);

}