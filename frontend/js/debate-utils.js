const DebateUtils = {

    showToast(message) {

        console.log(message);

    },

    showModal(content) {

        let overlay =
            document.getElementById("debateModalOverlay");

        if (!overlay) {

            overlay = document.createElement("div");

            overlay.id = "debateModalOverlay";

            overlay.className = "debate-modal-overlay";

            overlay.innerHTML = `

                <div class="debate-modal">

                    <button
                        class="debate-modal-close">

                        ×

                    </button>

                    <div id="debateModalContent"></div>

                </div>

            `;

            document.body.appendChild(overlay);

            overlay
                .querySelector(".debate-modal-close")
                .onclick = () => this.closeModal();

            overlay.onclick = e => {

                if (e.target === overlay) {

                    this.closeModal();

                }

            };

        }

        document.getElementById(
            "debateModalContent"
        ).innerHTML = content;

        overlay.style.display = "flex";

    },

    closeModal() {

        const overlay =
            document.getElementById("debateModalOverlay");

        if (overlay) {

            overlay.style.display = "none";

        }

    },

    formatTime(seconds) {

        const minutes = Math.floor(seconds / 60);

        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;

    },

    redirectToLogin() {

        window.location.href = "login.html";

    }

};