/* ==========================================================
   Award Management
   FIC FURY Admin Portal
========================================================== */
let awardsUnlocked = false;
let currentCommitteeId = null;
let currentCommitteeName = null;
/* ==========================================================
   Application State
========================================================== */

const AwardManagerApp = {

    initialize,
    loadAwards,
    renderTable,
    applyFilters,
    openDrawer,
    closeDrawer,
    saveAward,
    exportAwards

};


/* ==========================================================
   Cached DOM Elements
========================================================== */

const DOM = {

    tableBody: document.getElementById("TableBody"),

    searchInput: document.getElementById("searchInput"),

    committeeFilter: document.getElementById("committeeFilter"),

    awardFilter: document.getElementById("awardFilter"),

    addAwardBtn: document.getElementById("addAwardBtn"),

    exportBtn: document.getElementById("exportBtn"),

    drawer: document.getElementById("awardDrawer"),

    modal: document.getElementById("awardModal"),

    deleteModal: document.getElementById("deleteModal"),

    totalAwards: document.getElementById("totalAwards"),

    bestDelegateCount: document.getElementById("bestDelegateCount"),

    outstandingCount: document.getElementById("outstandingCount"),

    participationCount: document.getElementById("participationCount"),

    emptyState: document.getElementById("emptyState"),

    pagination: document.getElementById("pagination")

};
const State = {

    awards: [],
    filteredAwards: [],
    currentPage: 1,
    pageSize: 10,
    editingAwardId: null

};
const AwardManager = {

    awards: [],
    filteredAwards: [],
    currentPage: 1,
    pageSize: 10

};


/* ==========================================================
   Initialization
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    AwardManagerApp.initialize
);


async function initialize() {

    try {

        registerEvents();

        await loadInitialData();

    }

    catch (error) {

        console.error("Initialization failed", error);

    }

}

async function loadInitialData() {

    try {

        /*
         * FIRST:
         * Determine whether the debate has ended.
         */

        await loadDebateSession();


        /*
         * If the debate has not ended,
         * don't load award-management data yet.
         */

        if (!awardsUnlocked) {

            console.log(
                "Awards are locked. Skipping award management data."
            );

            return;

        }


        /*
         * Debate is complete.
         * Now load the award-management data.
         */

        await Promise.all([
            loadCommittees(),
            loadDelegates(),
            loadAwards()
        ]);

    }
    catch (error) {

        console.error(
            "Failed to load award management:",
            error
        );

    }

}
/* ==========================================================
   API Methods
========================================================== */

async function loadAwards() {

    try {

        const awards =
            await apiRequest("/awards");


        const allAwards =
            Array.isArray(awards)
                ? awards
                : [];


        /*
         * Only show awards belonging to
         * the current chair's committee.
         */

        const committeeAwards =
            allAwards.filter(award => {

                const committeeId =
                    award.registration?.committee?.id ??
                    award.registration?.committeeId;


                return Number(committeeId) ===
                    Number(currentCommitteeId);

            });


        console.log(
            "Current committee:",
            currentCommitteeId,
            currentCommitteeName
        );


        console.log(
            "All awards:",
            allAwards
        );


        console.log(
            "Awards for current committee:",
            committeeAwards
        );


        AwardManager.awards =
            committeeAwards.map(
                normalizeAward
            );


        AwardManager.filteredAwards =
            [...AwardManager.awards];


        renderTable();

        updateStatistics();

        renderPagination();

        populateAwardFilter();

    }

    catch (error) {

        console.error(
            "Failed to load awards:",
            error
        );

        showToast(
            "Unable to load awards.",
            "error"
        );

    }

}

async function loadCommittees() {

    try {

        const committees = await apiRequest("/committees");

        AwardManager.committees = committees || [];

        populateCommitteeFilter();

    }

    catch (error) {

        console.error(error);

    }

}

async function loadDelegates() {

    try {

        const registrations =
            await apiRequest(
                "/registrations/chair"
            );


        console.log(
            "Chair registrations:",
            registrations
        );


        /*
         * The chair endpoint returns registrations
         * belonging to committees managed by the
         * authenticated chair.
         */
        AwardManager.delegates =
            Array.isArray(registrations)
                ? registrations
                : [];


        populateDelegateOptions();

    }
    catch (error) {

        console.error(
            "Failed to load chair registrations:",
            error
        );

        AwardManager.delegates = [];

        populateDelegateOptions();

    }

}
async function createAward(data) {

    try {

        await apiRequest("/awards", "POST", data);

        await loadAwards();

        showToast("Award created successfully.", "success");

    }

    catch (error) {

        console.error(error);

    }

}
async function updateAward(id, data) {

    try {

        await apiRequest(
            `/awards/${id}`,
            "PUT",
            data
        );


        await loadAwards();


        showToast(
            "Award updated successfully.",
            "success"
        );


    }
    catch (error) {

        console.error(
            "Failed to update award:",
            error
        );


        showToast(
            "Unable to update award.",
            "error"
        );


        throw error;

    }

}
async function deleteAward(id) {

    try {

        await apiRequest(`/awards/${id}`, "DELETE");

        await loadAwards();

        showToast("Award deleted.", "success");

    }

    catch (error) {

        console.error(error);

    }

}
function renderTable() {

    const tbody = DOM.tableBody;

    tbody.innerHTML = "";

    const start = (AwardManager.currentPage - 1) * AwardManager.pageSize;
    const end = start + AwardManager.pageSize;

    const pageData = AwardManager.filteredAwards.slice(start, end);

    if (pageData.length === 0) {

        renderEmptyState();

        return;

    }

    hideEmptyState();

    pageData.forEach(award => {

        tbody.insertAdjacentHTML(
            "beforeend",
            createAwardRow(award)
        );

    });

}
function createAwardRow(award) {

    return `

        <tr>

            <td>${award.delegateName}</td>

            <td>${award.committeeName}</td>

            <td>${award.characterName}</td>

            <td>

                ${getAwardBadge(award.awardType)}

            </td>

            <td>${award.presentedBy}</td>

            <td>${formatDate(award.date)}</td>

            <td>

                <button
                    class="btn btn-icon"
                    onclick="viewAward(${award.id})">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                    class="btn btn-icon"
                    onclick="editAward(${award.id})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="btn btn-icon danger"
                    onclick="confirmDelete(${award.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        </tr>

    `;

}
function updateStatistics() {

    const awards = AwardManager.awards;

    DOM.totalAwards.textContent =
        awards.length;

    DOM.bestDelegateCount.textContent =
        awards.filter(a => a.awardType === "BEST_DELEGATE").length;

    DOM.outstandingCount.textContent =
        awards.filter(a => a.awardType === "OUTSTANDING_DELEGATE").length;

    DOM.participationCount.textContent =
        awards.filter(a => a.awardType === "PARTICIPATION").length;

}
function renderEmptyState() {

    DOM.emptyState?.classList.remove("hidden");

}
function hideEmptyState() {

    DOM.emptyState?.classList.add("hidden");

}
function renderPagination() {

     if (!DOM.pagination)
        return;

    const totalPages = Math.ceil(

        AwardManager.filteredAwards.length /

        AwardManager.pageSize

    );

    DOM.pagination.innerHTML = "";

    if (totalPages <= 1)
        return;

    for (let page = 1; page <= totalPages; page++) {

        DOM.pagination.insertAdjacentHTML(

            "beforeend",

            `

            <button
                class="page-btn ${page === AwardManager.currentPage ? "active" : ""}"

                onclick="changePage(${page})">

                ${page}

            </button>

            `

        );

    }

}
function changePage(page) {

    AwardManager.currentPage = page;

    renderTable();

    renderPagination();

}
function applyFilters() {

    const searchText =
        DOM.searchInput.value.trim().toLowerCase();

    const committee =
        DOM.committeeFilter.value;

    const award =
        DOM.awardFilter.value;

    AwardManager.filteredAwards =
        AwardManager.awards.filter(item => {

            const matchesSearch =

                item.delegateName?.toLowerCase().includes(searchText) ||

                item.characterName?.toLowerCase().includes(searchText) ||

                item.presentedBy?.toLowerCase().includes(searchText);

            const matchesCommittee =

                !committee ||

                item.committeeId == committee;

            const matchesAward =

                !award ||

                item.awardType === award;

            return (

                matchesSearch &&

                matchesCommittee &&

                matchesAward

            );

        });

    AwardManager.currentPage = 1;

    renderTable();

    renderPagination();

}
function populateCommitteeFilter() {

    DOM.committeeFilter.innerHTML = `

        <option value="">
            All Committees
        </option>

    `;

    AwardManager.committees.forEach(committee => {

        DOM.committeeFilter.insertAdjacentHTML(

            "beforeend",

            `

            <option value="${committee.id}">

                ${committee.name}

            </option>

            `

        );

    });

}
function populateAwardFilter() {

    DOM.awardFilter.innerHTML = `

        <option value="">
            All Awards
        </option>

    `;

    const awardTypes = [

        ...new Set(

            AwardManager.awards.map(a => a.awardType)

        )

    ];

    awardTypes.forEach(type => {

        DOM.awardFilter.insertAdjacentHTML(

            "beforeend",

            `

            <option value="${type}">

                ${type}

            </option>

            `

        );

    });

}
function registerEvents() {

    DOM.searchInput.addEventListener("input", applyFilters);

    DOM.committeeFilter.addEventListener("change", applyFilters);

    DOM.awardFilter.addEventListener("change", applyFilters);

    DOM.addAwardBtn.addEventListener("click", () => openAwardModal());

    document
        .getElementById("addAwardBtnEmpty")
        ?.addEventListener("click", () => openAwardModal());

    DOM.exportBtn.addEventListener("click", exportAwards);

    document
        .getElementById("awardForm")
        ?.addEventListener("submit", saveAward);

document
    .getElementById("closeAwardModal")
    ?.addEventListener(
        "click",
        closeAwardModal
    );


document
    .getElementById("cancelAward")
    ?.addEventListener(
        "click",
        closeAwardModal
    );
document
    .getElementById("awardModal")
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "awardModal"
            ) {

                closeAwardModal();

            }

        }
    );

document
    .getElementById("cancelDeleteBtn")
    ?.addEventListener(
        "click",
        closeDeleteModal
    );


document
    .getElementById("confirmDeleteBtn")
    ?.addEventListener(
        "click",
        confirmDeleteAction
    );

}
async function openDrawer(id) {

    const award = AwardManager.awards.find(a => a.id === id);

    if (!award)
        return;

    renderDrawerContent(award);

    DOM.drawer.classList.add("open");

}
function closeDrawer() {

    DOM.drawer.classList.remove("open");

}
function renderDrawerContent(award) {

    DOM.drawer.innerHTML = `

        <div class="drawer-header">

            <h2>

                Award Details

            </h2>

            <button
                class="btn btn-icon"

                onclick="closeDrawer()">

                <i class="fa-solid fa-xmark"></i>

            </button>

        </div>

        <div class="drawer-body">

            <div class="drawer-content">

                <div class="detail-item">

                    <label>Delegate</label>

                    <span>${award.delegateName}</span>

                </div>

                <div class="detail-item">

                    <label>Committee</label>

                    <span>${award.committeeName}</span>

                </div>

                <div class="detail-item">

                    <label>Character</label>

                    <span>${award.characterName}</span>

                </div>

                <div class="detail-item">

                    <label>Award</label>

                    ${getAwardBadge(award.awardType)}

                </div>

                <div class="detail-item">

                    <label>Presented By</label>

                    <span>${award.presentedBy}</span>

                </div>

            </div>

        </div>

    `;

}
function updateAwardModalTitle(editing = false) {

    const title = document.getElementById("awardModalTitle");

    if (!title) {
        console.warn("awardModalTitle not found");
        return;
    }

    title.textContent = editing
        ? "Edit Award"
        : "New Award";
}
function openAwardModal(id = null) {
updateAwardModalTitle(
    id !== null
);
    if (!isAwardManagementUnlocked()) {

        showToast(
            "Awards are locked until the debate session is completed.",
            "warning"
        );

        return;
    }


    AwardManager.editingAwardId = id;


    if (id) {

        const award =
            AwardManager.awards.find(
                award => Number(award.id) === Number(id)
            );


        if (!award) {

            showToast(
                "Award could not be found.",
                "error"
            );

            return;
        }


        populateAwardForm(award);

    }
    else {

        clearAwardForm();

    }


    DOM.modal.classList.remove("hidden");

}
function populateAwardForm(award) {

    const delegate =
        document.getElementById("delegate");

    const awardType =
        document.getElementById("awardType");

    const presentedBy =
        document.getElementById("presentedBy");

    const awardDate =
        document.getElementById("awardDate");


    if (delegate) {

        delegate.value =
            award.registrationId || "";

    }


    if (awardType) {

        awardType.value =
            award.awardType || "";

    }


    if (presentedBy) {

        presentedBy.value =
            award.presentedBy || "";

    }


    if (awardDate) {

        awardDate.value =
            award.date || "";

    }

}
function clearAwardForm() {

    const form = document.getElementById("awardForm");
    form?.reset();

    populateDelegateOptions();

}
function closeAwardModal() {

    DOM.modal?.classList.add("hidden");
    AwardManager.editingAwardId = null;

}

function populateAwardForm(award) {

    const delegate =
        document.getElementById("delegate");

    const awardType =
        document.getElementById("awardType");

    const presentedBy =
        document.getElementById("presentedBy");

    const awardDate =
        document.getElementById("awardDate");


    if (delegate) {

        delegate.value =
            award.registrationId || "";

    }


    if (awardType) {

        awardType.value =
            award.awardType || "";

    }


    if (presentedBy) {

        presentedBy.value =
            award.presentedBy || "";

    }


    if (awardDate) {

        awardDate.value =
            award.date || "";

    }

}
async function confirmDeleteAction() {

    if (!isAwardManagementUnlocked()) {

        showToast(
            "Awards are locked until the debate session is completed.",
            "warning"
        );

        return;
    }


    await deleteAward(
        AwardManager.editingAwardId
    );


    closeDeleteModal();

}
function confirmDelete(id) {

    if (!isAwardManagementUnlocked()) {

        showToast(
            "Awards can only be deleted after the debate session is completed.",
            "warning"
        );

        return;
    }

    const award = AwardManager.awards.find(
        a => Number(a.id) === Number(id)
    );

    if (!award) {

        showToast(
            "Award could not be found.",
            "error"
        );

        return;
    }

    // Store the award being deleted
    AwardManager.editingAwardId = id;

    // Open confirmation modal
    if (DOM.deleteModal) {
        DOM.deleteModal.classList.remove("hidden");
    }
}

async function saveAward(event) {

    event.preventDefault();


    if (!isAwardManagementUnlocked()) {

        showToast(
            "Awards are locked until the debate session is completed.",
            "warning"
        );

        return;
    }


    const form =
        document.getElementById("awardForm");


    if (!form) {

        console.error(
            "Award form not found."
        );

        return;
    }


    if (!form.checkValidity()) {

        form.reportValidity();

        return;
    }


    const registrationId =
        Number(
            document.getElementById(
                "delegate"
            ).value
        );


    if (!registrationId) {

        showToast(
            "Please select a delegate.",
            "warning"
        );

        return;
    }


    const data = {

        registration: {

            id: registrationId

        },

        awardType:
            document.getElementById(
                "awardType"
            ).value,

        presentedBy:
            document.getElementById(
                "presentedBy"
            ).value.trim(),

        presentedDate:
            document.getElementById(
                "awardDate"
            ).value

    };


    try {

        if (
            AwardManager.editingAwardId
        ) {

            await updateAward(
                AwardManager.editingAwardId,
                data
            );

        }
        else {

            await createAward(data);

        }


        closeAwardModal();


    }
    catch (error) {

        console.error(
            "Failed to save award:",
            error
        );

    }

}
function isAwardManagementUnlocked() {
    return awardsUnlocked === true;
}


   function editAward(id) {

    if (!isAwardManagementUnlocked()) {

        showToast(
            "Awards can only be edited after the debate session is completed.",
            "warning"
        );

        return;
    }

    openAwardModal(id);
}


function viewAward(id) {

    openDrawer(id);

}

function getAwardBadge(type) {

    const classes = {

        BEST_DELEGATE: "badge badge-gold",

        OUTSTANDING_DELEGATE: "badge badge-purple",

        HIGH_COMMENDATION: "badge badge-blue",

        PARTICIPATION: "badge badge-gray"

    };

    return `

        <span class="${classes[type] || "badge"}">

            ${type}

        </span>

    `;

}
function formatDate(date) {

    return new Date(date).toLocaleDateString();

}
function showToast(message, type = "success") {

    console.log(type, message);

}

function exportAwards() {

    const rows = AwardManager.filteredAwards || [];

    if (!rows.length) {
        showToast("No awards to export.", "warning");
        return;
    }

    const csvValue = value =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

    let csv = "Delegate,Committee,Character,Award,Presented By,Date\n";

    rows.forEach(item => {

        csv += [

            csvValue(item.delegateName),
            csvValue(item.committeeName),
            csvValue(item.characterName),
            csvValue(item.awardType),
            csvValue(item.presentedBy),
            csvValue(item.date)

        ].join(",") + "\n";

    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "awards.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("Awards exported successfully.", "success");

}
function getAward(id) {

    return State.awards.find(
        award => award.id === id
    );

}
const AwardAPI = {

    getAll: () => apiRequest(API.AWARDS),

    create: data =>
        apiRequest(API.AWARDS, {
            method: "POST",
            body: JSON.stringify(data)
        }),

    update: (id, data) =>
        apiRequest(`${API.AWARDS}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        }),

    remove: id =>
        apiRequest(`${API.AWARDS}/${id}`, {
            method: "DELETE"
        })

};
function normalizeAward(award) {

    const registration = award.registration || {};

    return {
        id: award.id,
        registrationId: registration.id,
        delegateName: registration.user?.fullName || "-",
        committeeName: registration.committee?.name || "-",
        committeeId: registration.committee?.id,
        characterName: registration.character?.name || registration.character?.title || "-",
        awardType: award.awardType || "-",
        presentedBy: award.presentedBy || "-",
        date: award.presentedDate || ""
    };

}
function populateDelegateOptions() {

    const select =
        document.getElementById("delegate");

    if (!select) {
        console.warn("Delegate select not found");
        return;
    }

    select.replaceChildren(
        new Option("Select a delegate", "")
    );


    const registrations =
        Array.isArray(AwardManager.delegates)
            ? AwardManager.delegates
            : [];


    const committeeDelegates =
        registrations.filter(registration => {

            const registrationCommitteeId =
                registration.committee?.id ??
                registration.committeeId;

            const registrationCommitteeName =
                registration.committee?.name ??
                registration.committeeName;


            const matchesId =
                Number(registrationCommitteeId) ===
                Number(currentCommitteeId);


            const matchesName =
                registrationCommitteeName ===
                currentCommitteeName;


            return matchesId || matchesName;

        });


    console.log(
        "Filtered delegates:",
        committeeDelegates
    );


    if (committeeDelegates.length === 0) {

        select.replaceChildren(
            new Option(
                "No delegates found for this committee",
                ""
            )
        );

        return;
    }


    committeeDelegates.forEach(
        registration => {

            const option =
                document.createElement("option");


            option.value =
                registration.id;


            const delegateName =
                registration.user?.fullName ||
                registration.delegateName ||
                registration.delegate?.fullName ||
                "Unknown Delegate";


            const characterName =
                registration.character?.name ||
                registration.character?.title ||
                registration.characterName ||
                "No Character";


            option.textContent =
                `${delegateName} — ${characterName}`;


            select.appendChild(option);

        }
    );

}
async function loadDebateSession() {

    try {

        const user = Auth.getCurrentUser();

        if (!user || !user.id) {

            lockAwardManagement(
                "Unable to identify the current chair."
            );

            return false;
        }

        console.log(
            "Checking debate session for chair:",
            user.id
        );

        const session =
            await apiRequest(
                `/debate/sessions/chair/${user.id}`
            );

        console.log(
            "Chair debate session:",
            session
        );

if (
    session &&
    session.status === "STOPPED"
) {

    currentCommitteeId =
        session.committeeId;

    currentCommitteeName =
        session.committeeName;

    unlockAwardManagement(session);

    return true;
}


        lockAwardManagement(
            "Awards will become available after the debate session is completed."
        );

        return false;

    }
    catch (error) {

        console.error(
            "Failed to load chair debate session:",
            error
        );

        lockAwardManagement(
            "Unable to verify the debate session status."
        );

        return false;
    }
}

function lockAwardManagement(message) {

    const button =
        document.getElementById("addAwardBtn");

    const status =
        document.getElementById(
            "awardSessionStatus"
        );

    const title =
        document.getElementById(
            "awardSessionTitle"
        );

    const messageElement =
        document.getElementById(
            "awardSessionMessage"
        );


    // Lock New Award button

    if (button) {

        button.disabled = true;

        button.innerHTML = `
            <i class="fas fa-lock"></i>
            Awards Locked
        `;

    }


    // Change status banner

    if (status) {

        status.classList.remove("unlocked");

        status.classList.add("locked");

    }


    if (title) {

        title.textContent =
            "Awards Locked";

    }


    if (messageElement) {

        messageElement.textContent =
            message ||
            "Awards will become available after the debate session is completed.";

    }


    // Change icon

    const icon =
        status?.querySelector(
            ".award-session-icon i"
        );

    if (icon) {

        icon.className =
            "fas fa-lock";

    }

}
function unlockAwardManagement(session) {

    awardsUnlocked = true;

    const button =
        document.getElementById("addAwardBtn");

    const status =
        document.getElementById(
            "awardSessionStatus"
        );

    const title =
        document.getElementById(
            "awardSessionTitle"
        );

    const message =
        document.getElementById(
            "awardSessionMessage"
        );


    if (button) {

        button.disabled = false;

        button.innerHTML = `
            <i class="fas fa-plus"></i>
            New Award
        `;

    }


    if (status) {

        status.classList.remove(
            "locked"
        );

        status.classList.add(
            "unlocked"
        );

    }


    if (title) {

        title.textContent =
            "Awards Management Unlocked";

    }


    if (message) {

        message.textContent =
            "The debate session is complete. You can now manage awards.";

    }


    const icon =
        status?.querySelector(
            ".award-session-icon i"
        );


    if (icon) {

        icon.className =
            "fas fa-trophy";

    }

}
function closeDeleteModal() {

    const modal =
        document.getElementById("deleteModal");

    if (modal) {

        modal.classList.add("hidden");

    }

    AwardManager.editingAwardId = null;

}