/* ==========================================================
   FIC FURY — GLOBAL TOAST SYSTEM
   ========================================================== */

(function () {

    "use strict";


    /* ======================================================
       CREATE CONTAINER
    ====================================================== */

    function getContainer() {

        let container =
            document.getElementById(
                "furyToastContainer"
            );


        if (!container) {

            container =
                document.createElement("div");

            container.id =
                "furyToastContainer";

            container.className =
                "fury-toast-container";

            container.setAttribute(
                "aria-live",
                "polite"
            );

            container.setAttribute(
                "aria-atomic",
                "true"
            );


            document.body.appendChild(
                container
            );

        }


        return container;

    }


    /* ======================================================
       SHOW TOAST
    ====================================================== */

    function showToast(
        message,
        type = "info",
        duration = 3500
    ) {

        const container =
            getContainer();


        const toast =
            document.createElement("div");


        /*
         * IMPORTANT:
         * Do NOT add "hide" initially.
         */

        toast.className =
            `fury-toast fury-toast-${type}`;


        const icons = {

            success: "✓",

            error: "×",

            warning: "!",

            info: "i"

        };


        const icon =
            icons[type] || "i";


        toast.innerHTML = `

            <div class="fury-toast-icon">
                ${icon}
            </div>

            <div class="fury-toast-message">
                ${escapeHtml(message)}
            </div>

            <button
                type="button"
                class="fury-toast-close"
                aria-label="Dismiss notification"
            >
                ×
            </button>

        `;


        container.appendChild(
            toast
        );


        /*
         * Force the browser to render the
         * initial state before adding "show".
         */

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                toast.classList.add(
                    "show"
                );

            });

        });


        /* ==================================================
           CLOSE BUTTON
        ================================================== */

        const closeButton =
            toast.querySelector(
                ".fury-toast-close"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => {

                    removeToast(
                        toast
                    );

                }
            );

        }


        /* ==================================================
           AUTO DISMISS
        ================================================== */

        toast._timeout =
            setTimeout(
                () => {

                    removeToast(
                        toast
                    );

                },
                duration
            );


        return toast;

    }


    /* ======================================================
       REMOVE TOAST
    ====================================================== */

    function removeToast(toast) {

        if (!toast) {
            return;
        }


        if (toast._timeout) {

            clearTimeout(
                toast._timeout
            );

        }


        toast.classList.remove(
            "show"
        );


        toast.classList.add(
            "hide"
        );


        setTimeout(() => {

            if (toast.parentNode) {

                toast.parentNode.removeChild(
                    toast
                );

            }

        }, 300);

    }


    /* ======================================================
       ESCAPE HTML
    ====================================================== */

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            String(value);


        return div.innerHTML;

    }


    /* ======================================================
       PUBLIC API
    ====================================================== */

    window.FuryToast = {

        show:
            showToast,


        success:
            function (
                message,
                duration
            ) {

                return showToast(
                    message,
                    "success",
                    duration
                );

            },


        error:
            function (
                message,
                duration
            ) {

                return showToast(
                    message,
                    "error",
                    duration
                );

            },


        warning:
            function (
                message,
                duration
            ) {

                return showToast(
                    message,
                    "warning",
                    duration
                );

            },


        info:
            function (
                message,
                duration
            ) {

                return showToast(
                    message,
                    "info",
                    duration
                );

            }

    };


})();