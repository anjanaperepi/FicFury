const Utils = {

saveToStorage(key,value){

localStorage.setItem(
key,
JSON.stringify(value)
);

},

getFromStorage(key){

const value =
localStorage.getItem(key);

return value ?
JSON.parse(value)
:
null;

},

removeFromStorage(key){

localStorage.removeItem(key);

},

showToast(message, type = "success") {

    let container = document.getElementById(
        "toastContainer"
    );

    if (!container) {

        container = document.createElement("div");

        container.id = "toastContainer";

        container.className = "toast-container";

        document.body.appendChild(container);

    }

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    let icon = "fa-circle-check";

    if (type === "error")
        icon = "fa-circle-xmark";

    if (type === "warning")
        icon = "fa-triangle-exclamation";

    if (type === "info")
        icon = "fa-circle-info";

    toast.innerHTML = `

        <i class="fa-solid ${icon}"></i>

        <span>${message}</span>

    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

},
showLoader() {

    let loader = document.getElementById(
        "loadingOverlay"
    );

    if (loader) {

        loader.classList.remove("hidden");

    }

},

hideLoader() {

    let loader = document.getElementById(
        "loadingOverlay"
    );

    if (loader) {

        loader.classList.add("hidden");

    }

},
confirmAction(message){

    return confirm(message);

},
async withLoader(callback){

    try{

        Utils.showLoader();

        return await callback();

    }

    finally{

        Utils.hideLoader();

    }

},
formatDate(date){

    if(!date) return "-";

    return new Date(date)

        .toLocaleDateString();

},
isValidEmail(email){

return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

.test(email);

},

isEmpty(value){

return value==null ||

value==="";

},
redirect(url){

window.location.href =
url;

}

};