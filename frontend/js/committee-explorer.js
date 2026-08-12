let allCommittees = [];

let currentRegistration = null;
let selectedCommitteeName = "";
document.addEventListener("DOMContentLoaded", async () => {

    allCommittees =
        await loadCommittees();

    renderCommittees(
        allCommittees
    );

    setupFilters();

    await loadCurrentRegistration();

    renderRegistrationNotice();

});
let selectedCommitteeId = null;
let selectedCharacterId = null;
/* ==========================================================
   SEARCH & FILTERS
========================================================== */

function setupFilters() {

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const modeFilter = document.getElementById("modeFilter");

    if (!searchInput || !categoryFilter || !modeFilter) {
        console.warn("Committee filter controls not found.");
        return;
    }

    populateCategoryFilter();

    searchInput.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);
    modeFilter.addEventListener("change", applyFilters);
}


/* ==========================================================
   CATEGORY OPTIONS
========================================================== */

function populateCategoryFilter() {

    const categoryFilter =
        document.getElementById("categoryFilter");

    if (!categoryFilter) return;

    const categories = [
        ...new Set(
            allCommittees
                .map(committee =>
                    formatText(committee.category || "General")
                )
                .filter(Boolean)
        )
    ].sort();

    categoryFilter.innerHTML = `
        <option value="">All Categories</option>
        ${categories.map(category => `
            <option value="${category}">
                ${category}
            </option>
        `).join("")}
    `;
}


/* ==========================================================
   APPLY FILTERS
========================================================== */

function applyFilters() {

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const modeFilter =
        document.getElementById("modeFilter");

    if (!searchInput || !categoryFilter || !modeFilter) {
        return;
    }

    const searchTerm =
        searchInput.value.trim().toLowerCase();

    const selectedCategory =
        categoryFilter.value.toLowerCase();

    const selectedMode =
        modeFilter.value.toLowerCase();

    const filteredCommittees =
        allCommittees.filter(committee => {

            const name =
                (committee.name || "").toLowerCase();

            const chair =
                (committee.chairpersonName || "").toLowerCase();

            const category =
                formatText(
                    committee.category || "General"
                ).toLowerCase();

            const description =
                (committee.description || "").toLowerCase();

            const mode =
                (committee.mode || "").toLowerCase();

            const matchesSearch =
                !searchTerm ||
                name.includes(searchTerm) ||
                chair.includes(searchTerm) ||
                category.includes(searchTerm) ||
                description.includes(searchTerm);

            const matchesCategory =
                !selectedCategory ||
                category === selectedCategory;

            const matchesMode =
                !selectedMode ||
                mode === selectedMode;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesMode
            );
        });

    renderCommittees(filteredCommittees);
}


/* ==========================================================
   RESULTS COUNT
========================================================== */

function updateResultsCount(count) {

    const resultsCount =
        document.getElementById("resultsCount");

    if (!resultsCount) return;

    resultsCount.textContent =
        `${count} ${count === 1 ? "Committee" : "Committees"}`;
}
function showLoading() {

    document
        .getElementById("loadingOverlay")
        .classList.remove("hidden");

}

function hideLoading() {

    document
        .getElementById("loadingOverlay")
        .classList.add("hidden");

}

function formatText(value) {

    if (!value) return "N/A";

    return value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

}

async function loadCommittees() {

    showLoading();

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/committees`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(CONFIG.TOKEN_KEY)}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load committees.");
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        return [];

    } finally {

        hideLoading();

    }

}

async function loadCurrentRegistration() {

    const user = JSON.parse(
        localStorage.getItem(CONFIG.USER_KEY)
    );

    if (!user || !user.id) {
        return null;
    }

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}/registrations/user/${user.id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem(CONFIG.TOKEN_KEY)}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                "Unable to load registration status."
            );

        }

        const registrations =
            await response.json();

        if (!Array.isArray(registrations)) {
            return null;
        }

        /*
         * Only these statuses count as the delegate's
         * current registration.
         *
         * These match the backend validation:
         * PENDING_ADMIN
         * PENDING_CHAIR
         * ACTIVE
         */

        currentRegistration =
            registrations.find(registration => {

                const status =
                    registration.workflowStatus;

                return (
                    status === "PENDING_ADMIN" ||
                    status === "PENDING_CHAIR" ||
                    status === "ACTIVE"
                );

            }) || null;

        return currentRegistration;

    } catch (error) {

        console.error(
            "Unable to determine current registration:",
            error
        );

        return null;
    }
}
function renderRegistrationNotice() {

    const notice =
        document.getElementById(
            "registrationNotice"
        );

    const message =
        document.getElementById(
            "registeredCommitteeMessage"
        );

    if (!notice || !message) {
        return;
    }

    if (!currentRegistration) {

        notice.classList.add("hidden");

        return;
    }

    const committeeName =
        currentRegistration.committee?.name ||
        "your current committee";

    const characterName =
        currentRegistration.character?.name ||
        currentRegistration.character?.title ||
        null;

    let statusText =
        "Your registration is being processed.";

    if (
        currentRegistration.workflowStatus ===
        "ACTIVE"
    ) {

        statusText =
            "Your registration is active.";

    } else if (
        currentRegistration.workflowStatus ===
        "PENDING_ADMIN"
    ) {

        statusText =
            "Your registration is awaiting admin approval.";

    } else if (
        currentRegistration.workflowStatus ===
        "PENDING_CHAIR"
    ) {

        statusText =
            "Your registration has been approved by Admin and is awaiting chair approval.";

    }

    message.innerHTML = `
        You're registered for
        <strong>${committeeName}</strong>
        ${characterName
            ? `as <strong>${characterName}</strong>.`
            : "."}
        ${statusText}
        You can still browse all committees,
        but you cannot register for another committee
        while this registration is active.
    `;

    notice.classList.remove("hidden");
}
function renderCommittees(committees) {

    const grid =
        document.getElementById("committeeGrid");

    const emptyState =
        document.getElementById("emptyState");

    if (!grid || !emptyState) return;

    grid.innerHTML = "";

    updateResultsCount(committees.length);

    if (committees.length === 0) {

        emptyState.classList.remove("hidden");

        return;
    }

    emptyState.classList.add("hidden");

    committees.forEach(committee => {

        grid.insertAdjacentHTML(
            "beforeend",
            createCommitteeCard(committee)
        );

    });
}

function createCommitteeCard(committee) {

const category =
    formatText(committee.category || "General");

const mode =
    (committee.mode || "").toUpperCase();

    const location =
        mode === "ONLINE"
            ? "Online Meeting"
            : committee.venue;

    return `

<article class="committee-card"
         data-id="${committee.id}">

<div class="committee-banner">

    <span>${category}</span>

    <span>${formatText(committee.mode)}</span>

</div>

    <div class="committee-content">

        <h2>${committee.name}</h2>

        <p>
            <i class="fa-solid fa-user-tie"></i>
            ${committee.chairpersonName}
        </p>

        <p>
            <i class="fa-solid fa-calendar"></i>
            ${committee.date} • ${committee.time}
        </p>

        <p>
            <i class="fa-solid fa-location-dot"></i>
            ${location}
        </p>

        <button class="view-details-btn">

            View Details

        </button>

    </div>

</article>

`;

}
function openModal() {

    document
        .getElementById("committeeModal")
        .classList.remove("hidden");

}

function closeModal() {

    document
        .getElementById("committeeModal")
        .classList.add("hidden");

}
async function loadCommitteeDetails(id) {

   const response = await fetch(
    `${CONFIG.API_BASE_URL}/committees/${id}`,
    {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(CONFIG.TOKEN_KEY)}`
        }
    }
);
    if (!response.ok) {

        throw new Error("Unable to load committee.");

    }

    return await response.json();

}
function renderCommitteeModal(committee) {



    selectedCommitteeId = committee.id;
    selectedCommitteeName = committee.name;

    document.getElementById("modalTitle").textContent =
        "Committee Details";

    const details =
        document.getElementById("committeeDetails");


    details.innerHTML = `
<div class = "stat-card">
        <h2>${committee.name}</h2>

<p><strong>Category:</strong>
    ${formatText(committee.category || "General")}
</p>

        <div class="detail-section">

            <h3>Description</h3>

            <p>${committee.description}</p>

        </div>

        <div class="detail-section">

            <h3>Chairperson</h3>

            <p>${committee.chairpersonName}</p>

            <p>${committee.chairpersonEmail}</p>

        </div>

        <div class="detail-section">

            <h3>Date & Time</h3>

            <p>${committee.date}</p>

            <p>${committee.time}</p>

        </div>

        <div class="detail-section">

            <h3>Mode</h3>

            <p>${formatText(committee.mode)}</p>

        </div>

        <div class="detail-section">

            <h3>${
                committee.mode.toUpperCase() === "ONLINE"
                    ? "Meeting Link"
                    : "Venue"
            }</h3>

            <p>${
                committee.mode.toUpperCase() === "ONLINE"
                    ? committee.meetingLink
                    : committee.venue
            }</p>

        </div>

${
    currentRegistration
        ? `
            <div class="already-registered-box">

                <div class="already-registered-icon">
                    <i class="fa-solid fa-lock"></i>
                </div>

                <div class="already-registered-content">

                    <strong>
                        Already Registered
                    </strong>

                    <span>
                        You already have an active committee registration.
                    </span>

                </div>

            </div>
        `
        : `
            <button
                id="loadCharactersBtn"
                class="btn-primary register-btn"
                data-committee-id="${committee.id}">

                <i class="fa-solid fa-user-plus"></i>
                Register

            </button>
        `
}

<div
    id="characterSelection"
    class="character-selection hidden">

</div>
</div>

    `;

}
document.addEventListener("click", async (event) => {

    const card = event.target.closest(".committee-card");

    if (!card) return;
    console.log(card.dataset.id);

    showLoading();

    try {

        const committee =
            await loadCommitteeDetails(card.dataset.id);

        renderCommitteeModal(committee);

        openModal();

    } catch (error) {

        console.error(error);

    } finally {

        hideLoading();

    }

});
document.addEventListener("DOMContentLoaded", () => {

    const closeBtn = document.getElementById("closeModal");
    const modal = document.getElementById("committeeModal");

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {

            if (event.target.id === "committeeModal") {
                closeModal();
            }

        });
    }

});
    async function loadCharacters(committeeId){

    const response = await fetch(
    `${CONFIG.API_BASE_URL}/characters/committee/${committeeId}`,
    {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(CONFIG.TOKEN_KEY)}`
        }
    }
);

    if(!response.ok){

        throw new Error("Unable to load characters.");

    }

    return await response.json();

}

function renderCharacters(characters) {

    const container =
        document.getElementById("characterSelection");

    if (!container) return;

    selectedCharacterId = null;

    container.classList.remove("hidden");

    if (!characters || characters.length === 0) {

        container.innerHTML = `
            <div class="character-empty-state">
                <i class="fa-solid fa-user-slash"></i>

                <h3>No Characters Available</h3>

                <p>
                    There are currently no characters available
                    for this committee.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <h3>Choose Your Character</h3>

        <p class="character-selection-help">
            Select the character you want to represent during the debate.
        </p>

        <div class="character-grid">
            ${characters.map(character => `
                <div
                    class="character-card"
                    data-id="${character.id}"
                    tabindex="0"
                    role="button"
                    aria-pressed="false">

                    <div class="character-card-header">
                        <h4>${character.name}</h4>

                        <span class="character-check">
                            <i class="fa-solid fa-check"></i>
                        </span>
                    </div>

                    <p class="character-title">
                        ${character.title || "No title specified"}
                    </p>

                    <div class="character-meta">
                        <span>
                            <strong>Difficulty</strong>
                            ${formatText(character.difficulty)}
                        </span>

                        <span>
                            <strong>Faction</strong>
                            ${character.faction || "Independent"}
                        </span>
                    </div>

                </div>
            `).join("")}
        </div>

        <button
            id="confirmRegistrationBtn"
            class="btn-primary register-btn"
            disabled>

            Select a Character First
        </button>
    `;
}
document.addEventListener("click", (event) => {

    const card =
        event.target.closest(".character-card");

    if (!card) return;

    document
        .querySelectorAll(".character-card")
        .forEach(characterCard => {

            characterCard.classList.remove("selected");
            characterCard.setAttribute(
                "aria-pressed",
                "false"
            );

        });

    card.classList.add("selected");

    card.setAttribute(
        "aria-pressed",
        "true"
    );

    selectedCharacterId =
        card.dataset.id;

    const confirmButton =
        document.getElementById(
            "confirmRegistrationBtn"
        );

    if (!confirmButton) return;

    confirmButton.disabled = false;

    confirmButton.textContent =
        "Confirm Registration";
});
document.addEventListener("click",async(event)=>{

    const button =
        event.target.closest("#loadCharactersBtn");

    if(!button) return;

    try{

        const characters =
            await loadCharacters(
                button.dataset.committeeId
            );

        renderCharacters(characters);

    }

    catch(error){

        console.error(error);

        alert("Unable to load characters.");

    }

});
async function registerDelegate(){

    const user =
        JSON.parse(
            localStorage.getItem(CONFIG.USER_KEY)
        );

    const response = await fetch(

        `${CONFIG.API_BASE_URL}/registrations/register`,

        {

            method:"POST",

            headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem(CONFIG.TOKEN_KEY)}`
},

            body:JSON.stringify({

                userId:user.id,

                committeeId:selectedCommitteeId,

                characterId:selectedCharacterId

            })

        }

    );

    if(!response.ok){

        throw new Error(
            await response.text()
        );

    }

    return await response.json();

}
document.addEventListener("click", async (event) => {

    if(event.target.id !== "confirmRegistrationBtn")
        return;

    if(!selectedCharacterId){

        alert("Please select a character.");

        return;

    }

    try{

        await registerDelegate();

document.getElementById("committeeDetails").innerHTML = `

    <div class="registration-success">

        <div class="success-icon">
            <i class="fa-solid fa-check"></i>
        </div>

        <span class="success-badge">
            Registration Complete
        </span>

        <h2>
            You're In!
        </h2>

        <p>
            You have successfully registered for this committee
            and claimed your character.
        </p>

        <div class="success-details">

            <div class="success-detail">
                <span>Committee</span>
                <strong>
                    ${selectedCommitteeName}
                </strong>
            </div>

            <div class="success-detail">
                <span>Character</span>
                <strong>
                    Registered
                </strong>
            </div>

        </div>

        <div class="success-actions">

            <button
                class="btn-primary"
                onclick="closeModal()">

                Continue Exploring

            </button>

        </div>

    </div>

`;

        closeModal();

    }

    catch (error) {

    // Remove any previous error banner
    const existingError = document.querySelector(".error-banner");
    if (existingError) {
        existingError.remove();
    }

    document.getElementById("characterSelection")
        .insertAdjacentHTML(
            "afterbegin",
            `
            <div class="error-banner">
                ${error.message}
            </div>
            `
        );

}

});
