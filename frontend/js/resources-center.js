document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!Auth.isLoggedIn()) {

            window.location.href =
                "login.html";

            return;
        }

        await loadResources();

        await loadFavorites();

    }
);


// =========================
// LOAD ALL RESOURCES
// =========================

async function loadResources() {

    try {

        const committeeId =
            getCommitteeId();

        const resources =
            await apiRequest(
                `/resources?committeeId=${committeeId}`
            );

        const container =
            document.getElementById(
                "resourceContainer"
            );

        if (!container) return;

        container.innerHTML = "";

        resources.forEach(resource => {

            const card =
                document.createElement("div");

            card.classList.add(
                "resource-card"
            );

            card.innerHTML = `

                <div class="resource-header">

                    <h3>
                        ${resource.title}
                    </h3>

                    <span class="resource-type">
                        ${resource.type}
                    </span>

                </div>

                <p>
                    ${resource.description}
                </p>

                <div class="resource-footer">

                    <button
                    onclick="downloadResource(${resource.id})">

                    Download

                    </button>

                    <button
                    onclick="toggleFavorite(${resource.id})">

                    ⭐

                    </button>

                </div>

            `;

            container.appendChild(card);

        });

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// DOWNLOAD RESOURCE
// =========================

async function downloadResource(id) {

    try {

        await apiRequest(
            `/resources/${id}/download`,
            "POST"
        );

        window.open(
            `${CONFIG.API_BASE_URL}/resources/${id}/file`,
            "_blank"
        );

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// SEARCH RESOURCES
// =========================

function searchResources() {

    const keyword =
        document
            .getElementById(
                "resourceSearch"
            )
            .value
            .toLowerCase();

    const cards =
        document.querySelectorAll(
            ".resource-card"
        );

    cards.forEach(card => {

        const content =
            card.innerText
                .toLowerCase();

        card.style.display =
            content.includes(keyword)
                ? "block"
                : "none";

    });

}


// =========================
// FILTER BY TYPE
// =========================

function filterResources() {

    const type =
        document.getElementById(
            "resourceTypeFilter"
        ).value;

    const cards =
        document.querySelectorAll(
            ".resource-card"
        );

    cards.forEach(card => {

        if (
            type === "ALL"
        ) {

            card.style.display =
                "block";

            return;

        }

        const cardType =
            card.querySelector(
                ".resource-type"
            ).innerText;

        card.style.display =
            cardType === type
                ? "block"
                : "none";

    });

}


// =========================
// FAVORITES
// =========================

async function toggleFavorite(id) {

    try {

        await apiRequest(
            `/resources/${id}/favorite`,
            "POST"
        );

        await loadFavorites();

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// LOAD FAVORITES
// =========================

async function loadFavorites() {

    try {

        const favorites =
            await apiRequest(
                "/resources/favorites"
            );

        const container =
            document.getElementById(
                "favoriteResources"
            );

        if (!container) return;

        container.innerHTML = "";

        favorites.forEach(item => {

            container.innerHTML += `

                <li>

                    ${item.title}

                </li>

            `;

        });

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// RECENT DOWNLOADS
// =========================

async function loadRecentDownloads() {

    try {

        const downloads =
            await apiRequest(
                "/resources/recent-downloads"
            );

        const container =
            document.getElementById(
                "recentDownloads"
            );

        if (!container) return;

        container.innerHTML = "";

        downloads.forEach(item => {

            container.innerHTML += `

                <li>

                    ${item.title}

                </li>

            `;

        });

    }
    catch(error){

        console.error(error);

    }

}


// =========================
// HELPERS
// =========================

function getCommitteeId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get(
            "committeeId"
        ) || ""
    );

}