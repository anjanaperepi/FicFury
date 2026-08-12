/* =========================================================
   FIC FURY — COMMITTEE MANAGEMENT
   ========================================================= */

const CommitteeApp = {

    committees: [],
    filteredCommittees: [],

    selectedCommittee: null,
    editingCommitteeId: null,
    deletingCommitteeId: null,

    currentPage: 1,
    pageSize: 8,

    filters: {
        search: "",
        mode: "",
        category: "",
        sort: "name"
    }

};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", initializeCommitteePage);


async function initializeCommitteePage() {

    try {

        if (typeof Auth !== "undefined" && !Auth.isLoggedIn()) {
            Utils.redirect("login.html");
            return;
        }

        registerEvents();

        await loadCommittees();

    } catch (error) {

        console.error(
            "Committee page initialization failed:",
            error
        );

    }

}


/* =========================================================
   EVENT REGISTRATION
   ========================================================= */

function registerEvents() {

    const search = document.getElementById("committeeSearch");

    if (search) {
        search.addEventListener("input", onSearch);
    }


    const modeFilter = document.getElementById("modeFilter");

    if (modeFilter) {
        modeFilter.addEventListener("change", onModeFilter);
    }


    const categoryFilter =
        document.getElementById("categoryFilter");

    if (categoryFilter) {
        categoryFilter.addEventListener(
            "change",
            onCategoryFilter
        );
    }


    const sortFilter =
        document.getElementById("sortFilter");

    if (sortFilter) {
        sortFilter.addEventListener(
            "change",
            onSort
        );
    }


    const refreshButton =
        document.getElementById("refreshCommittees");

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            loadCommittees
        );
    }


    const newCommitteeButton =
        document.getElementById("newCommitteeBtn");

    if (newCommitteeButton) {
        newCommitteeButton.addEventListener(
            "click",
            openCreateModal
        );
    }


    const exportButton =
        document.getElementById("exportCommittees");

    if (exportButton) {
        exportButton.addEventListener(
            "click",
            exportCommittees
        );
    }


    const cancelDelete =
        document.getElementById("cancelDeleteCommittee");

    if (cancelDelete) {
        cancelDelete.addEventListener(
            "click",
            closeDeleteModal
        );
    }


    const confirmDelete =
        document.getElementById("confirmDeleteCommittee");

    if (confirmDelete) {
        confirmDelete.addEventListener(
            "click",
            confirmDeleteCommittee
        );
    }


    const closeModal =
        document.getElementById("closeCommitteeModal");

    if (closeModal) {
        closeModal.addEventListener(
            "click",
            closeCommitteeModal
        );
    }


    const cancelCommittee =
        document.getElementById("cancelCommittee");

    if (cancelCommittee) {
        cancelCommittee.addEventListener(
            "click",
            closeCommitteeModal
        );
    }


    const committeeForm =
        document.getElementById("committeeForm");

    if (committeeForm) {
        committeeForm.addEventListener(
            "submit",
            saveCommittee
        );
    }


    const closeDrawerButton =
        document.getElementById("closeDrawer");

    if (closeDrawerButton) {
        closeDrawerButton.addEventListener(
            "click",
            closeDrawer
        );
    }


    const drawerOverlay =
        document.getElementById("drawerOverlay");

    if (drawerOverlay) {
        drawerOverlay.addEventListener(
            "click",
            closeDrawer
        );
    }


    const deleteModal =
        document.getElementById("deleteCommitteeModal");

    if (deleteModal) {

        deleteModal.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "deleteCommitteeModal"
                ) {
                    closeDeleteModal();
                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        handleKeyboard
    );

}


/* =========================================================
   LOAD COMMITTEES
   ========================================================= */

async function loadCommittees() {

    try {

        if (typeof Utils !== "undefined") {
            Utils.showLoader();
        }


        const response =
            await apiRequest("/committees");


        /*
         * Supports both:
         *
         * [
         *   {...}
         * ]
         *
         * and:
         *
         * {
         *   data: [...]
         * }
         */

        if (Array.isArray(response)) {

            CommitteeApp.committees = response;

        } else if (
            response &&
            Array.isArray(response.data)
        ) {

            CommitteeApp.committees =
                response.data;

        } else {

            CommitteeApp.committees = [];

        }


        CommitteeApp.filteredCommittees = [
            ...CommitteeApp.committees
        ];


        CommitteeApp.currentPage = 1;


        populateCategoryFilter();
        populateModeFilter();

        applyFilters();

    } catch (error) {

        console.error(
            "Failed to load committees:",
            error
        );


        if (typeof Utils !== "undefined") {

            Utils.showToast(
                "Unable to load committees",
                "error"
            );

        }

    } finally {

        if (typeof Utils !== "undefined") {
            Utils.hideLoader();
        }

    }

}


/* =========================================================
   RENDER PAGE
   ========================================================= */

function renderPage() {

    renderStatistics();

    renderCommitteeTable();

    renderPagination();

    renderEmptyState();

}


/* =========================================================
   STATISTICS
   ========================================================= */

function renderStatistics() {

    const committees =
        CommitteeApp.filteredCommittees;


    const committeeCount =
        document.getElementById("committeeCount");

    if (committeeCount) {
        committeeCount.textContent =
            committees.length;
    }


    const chairCount =
        document.getElementById("chairCount");

    if (chairCount) {

        chairCount.textContent =
            committees.filter(
                committee =>
                    committee.chairpersonName
            ).length;

    }


    const sessionCount =
        document.getElementById("sessionCount");

    if (sessionCount) {

        /*
         * The current backend does not expose
         * a separate session count.
         *
         * Existing application logic treats
         * each committee as one session.
         */

        sessionCount.textContent =
            committees.length;

    }


    const totalDelegates =
        committees.reduce(
            (sum, committee) =>
                sum +
                Number(
                    committee.delegateCount || 0
                ),
            0
        );


    const delegateCount =
        document.getElementById("delegateCount");

    if (delegateCount) {

        delegateCount.textContent =
            totalDelegates;

    }


    const committeeTotal =
        document.getElementById("committeeTotal");

    if (committeeTotal) {

        committeeTotal.textContent =
            `${committees.length} Committees`;

    }

}


/* =========================================================
   TABLE
   ========================================================= */

function renderCommitteeTable() {

    const tbody =
        document.getElementById(
            "committeeTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    const start =
        (CommitteeApp.currentPage - 1) *
        CommitteeApp.pageSize;


    const end =
        start +
        CommitteeApp.pageSize;


    const committees =
        CommitteeApp.filteredCommittees.slice(
            start,
            end
        );


    committees.forEach(
        committee => {

            tbody.appendChild(
                createCommitteeRow(
                    committee
                )
            );

        }
    );

}


/* =========================================================
   CREATE TABLE ROW
   ========================================================= */

function createCommitteeRow(committee) {

    const row =
        document.createElement("tr");


    const name =
        escapeHTML(
            committee.name ||
            "Unnamed Committee"
        );


    const category =
        escapeHTML(
            committee.category ||
            "General"
        );


    const chairperson =
        escapeHTML(
            committee.chairpersonName ||
            "-"
        );


    const mode =
        escapeHTML(
            committee.mode ||
            "-"
        );


    const date =
        formatDate(
            committee.date
        );


    const delegates =
        Number(
            committee.delegateCount || 0
        );


    row.innerHTML = `

        <td>

            <strong>
                ${name}
            </strong>

            <br>

            <small>
                ${category}
            </small>

        </td>


        <td>
            ${chairperson}
        </td>


        <td>

            <span class="badge badge-info">
                ${mode}
            </span>

        </td>


        <td>
            ${date}
        </td>


        <td>
            ${delegates}
        </td>


        <td>

            <span class="badge badge-success">
                Active
            </span>

        </td>


        <td>

            <div class="action-buttons">

                <button
                    type="button"
                    class="btn btn-primary btn-sm view-btn"
                    title="View Committee"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>


                <button
                    type="button"
                    class="btn btn-warning btn-sm edit-btn"
                    title="Edit Committee"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>


                <button
                    type="button"
                    class="btn btn-danger btn-sm delete-btn"
                    title="Delete Committee"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

        </td>

    `;


    const viewButton =
        row.querySelector(".view-btn");

    if (viewButton) {

        viewButton.onclick =
            () => viewCommittee(
                committee.id
            );

    }


    const editButton =
        row.querySelector(".edit-btn");

    if (editButton) {

        editButton.onclick =
            () => editCommittee(
                committee.id
            );

    }


    const deleteButton =
        row.querySelector(".delete-btn");

    if (deleteButton) {

        deleteButton.onclick =
            () => deleteCommittee(
                committee.id
            );

    }


    return row;

}


/* =========================================================
   SEARCH
   ========================================================= */

function onSearch(event) {

    CommitteeApp.filters.search =
        event.target.value
            .trim()
            .toLowerCase();


    CommitteeApp.currentPage = 1;

    applyFilters();

}


/* =========================================================
   MODE FILTER
   ========================================================= */

function onModeFilter(event) {

    CommitteeApp.filters.mode =
        event.target.value;


    CommitteeApp.currentPage = 1;

    applyFilters();

}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function onCategoryFilter(event) {

    CommitteeApp.filters.category =
        event.target.value;


    CommitteeApp.currentPage = 1;

    applyFilters();

}


/* =========================================================
   SORT
   ========================================================= */

function onSort(event) {

    CommitteeApp.filters.sort =
        event.target.value;


    CommitteeApp.currentPage = 1;

    applyFilters();

}


/* =========================================================
   POPULATE CATEGORY FILTER
   ========================================================= */

function populateCategoryFilter() {

    const select =
        document.getElementById(
            "categoryFilter"
        );


    if (!select) {
        return;
    }


    const categories = [
        ...new Set(

            CommitteeApp.committees
                .map(
                    committee =>
                        committee.category
                )
                .filter(Boolean)

        )
    ].sort();


    select.innerHTML =
        `<option value="">
            All Categories
        </option>`;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = category;

            option.textContent = category;

            select.appendChild(option);

        }
    );

}


/* =========================================================
   POPULATE MODE FILTER
   ========================================================= */

function populateModeFilter() {

    const select =
        document.getElementById(
            "modeFilter"
        );


    if (!select) {
        return;
    }


    const modes = [
        ...new Set(

            CommitteeApp.committees
                .map(
                    committee =>
                        committee.mode
                )
                .filter(Boolean)

        )
    ].sort();


    select.innerHTML =
        `<option value="">
            All Modes
        </option>`;


    modes.forEach(
        mode => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = mode;

            option.textContent = mode;

            select.appendChild(option);

        }
    );

}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyFilters() {

    let committees = [
        ...CommitteeApp.committees
    ];


    /*
     * SEARCH
     */

    if (
        CommitteeApp.filters.search
    ) {

        const keyword =
            CommitteeApp.filters.search;


        committees =
            committees.filter(
                committee => {

                    const name =
                        String(
                            committee.name || ""
                        ).toLowerCase();


                    const chairperson =
                        String(
                            committee.chairpersonName ||
                            ""
                        ).toLowerCase();


                    const category =
                        String(
                            committee.category ||
                            ""
                        ).toLowerCase();


                    return (
                        name.includes(keyword) ||
                        chairperson.includes(keyword) ||
                        category.includes(keyword)
                    );

                }
            );

    }


    /*
     * MODE
     */

    if (
        CommitteeApp.filters.mode
    ) {

        committees =
            committees.filter(
                committee =>
                    String(
                        committee.mode || ""
                    ) ===
                    CommitteeApp.filters.mode
            );

    }


    /*
     * CATEGORY
     */

    if (
        CommitteeApp.filters.category
    ) {

        committees =
            committees.filter(
                committee =>
                    String(
                        committee.category || ""
                    ) ===
                    CommitteeApp.filters.category
            );

    }


    /*
     * SORT
     */

    sortCommittees(committees);


    CommitteeApp.filteredCommittees =
        committees;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                committees.length /
                CommitteeApp.pageSize
            )
        );


    CommitteeApp.currentPage =
        Math.min(
            CommitteeApp.currentPage,
            totalPages
        );


    renderPage();

}


/* =========================================================
   SORT COMMITTEES
   ========================================================= */

function sortCommittees(committees) {

    switch (
        CommitteeApp.filters.sort
    ) {

        case "name":

            committees.sort(
                (a, b) =>
                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    )
            );

            break;


        case "date":

            committees.sort(
                (a, b) =>
                    new Date(
                        a.date || 0
                    ) -
                    new Date(
                        b.date || 0
                    )
            );

            break;


        case "date-desc":

            committees.sort(
                (a, b) =>
                    new Date(
                        b.date || 0
                    ) -
                    new Date(
                        a.date || 0
                    )
            );

            break;


        case "delegates":

            committees.sort(
                (a, b) =>
                    Number(
                        b.delegateCount || 0
                    ) -
                    Number(
                        a.delegateCount || 0
                    )
            );

            break;


        default:
            break;

    }

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function renderEmptyState() {

    const empty =
        document.getElementById(
            "emptyState"
        );


    if (!empty) {
        return;
    }


    if (
        CommitteeApp.filteredCommittees
            .length === 0
    ) {

        empty.classList.remove(
            "hidden"
        );

    } else {

        empty.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   PAGINATION
   ========================================================= */

function renderPagination() {

    const pagination =
        document.getElementById(
            "pagination"
        );


    if (!pagination) {
        return;
    }


    pagination.innerHTML = "";


    const totalPages =
        Math.ceil(
            CommitteeApp.filteredCommittees
                .length /
            CommitteeApp.pageSize
        );


    if (totalPages <= 1) {
        return;
    }


    /*
     * Previous
     */

    const previous =
        document.createElement(
            "button"
        );


    previous.type = "button";

    previous.className =
        "btn btn-outline";


    previous.innerHTML =
        `<i class="fa-solid fa-chevron-left"></i>`;


    previous.disabled =
        CommitteeApp.currentPage === 1;


    previous.onclick = () => {

        if (
            CommitteeApp.currentPage > 1
        ) {

            CommitteeApp.currentPage--;

            renderCommitteeTable();
            renderPagination();

        }

    };


    pagination.appendChild(previous);


    /*
     * Page buttons
     */

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type = "button";

        button.className =
            "btn btn-outline";


        if (
            i ===
            CommitteeApp.currentPage
        ) {

            button.classList.add(
                "btn-primary"
            );

        }


        button.textContent = i;


        button.onclick = () => {

            CommitteeApp.currentPage = i;

            renderCommitteeTable();

            renderPagination();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        };


        pagination.appendChild(button);

    }


    /*
     * Next
     */

    const next =
        document.createElement(
            "button"
        );


    next.type = "button";

    next.className =
        "btn btn-outline";


    next.innerHTML =
        `<i class="fa-solid fa-chevron-right"></i>`;


    next.disabled =
        CommitteeApp.currentPage ===
        totalPages;


    next.onclick = () => {

        if (
            CommitteeApp.currentPage <
            totalPages
        ) {

            CommitteeApp.currentPage++;

            renderCommitteeTable();
            renderPagination();

        }

    };


    pagination.appendChild(next);

}


/* =========================================================
   CREATE COMMITTEE
   ========================================================= */

function openCreateModal() {

    CommitteeApp.editingCommitteeId =
        null;


    const title =
        document.getElementById(
            "modalTitle"
        );

    if (title) {
        title.textContent =
            "Create Committee";
    }


    const form =
        document.getElementById(
            "committeeForm"
        );

    if (form) {
        form.reset();
    }


    const id =
        document.getElementById(
            "committeeId"
        );

    if (id) {
        id.value = "";
    }


    const modal =
        document.getElementById(
            "committeeModal"
        );

    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }


    setTimeout(
        () => {

            const name =
                document.getElementById(
                    "committeeName"
                );

            if (name) {
                name.focus();
            }

        },
        150
    );

}


/* =========================================================
   CLOSE CREATE / EDIT MODAL
   ========================================================= */

function closeCommitteeModal() {

    const modal =
        document.getElementById(
            "committeeModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   EDIT COMMITTEE
   ========================================================= */

async function editCommittee(id) {

    try {

        if (typeof Utils !== "undefined") {
            Utils.showLoader();
        }


        const committee =
            await apiRequest(
                "/committees/" + id
            );


        CommitteeApp.editingCommitteeId =
            id;


        const title =
            document.getElementById(
                "modalTitle"
            );

        if (title) {
            title.textContent =
                "Edit Committee";
        }


        setField(
            "committeeId",
            committee.id
        );


        setField(
            "committeeName",
            committee.name
        );


        setField(
            "committeeCategory",
            committee.category
        );


        setField(
            "committeeDescription",
            committee.description
        );


        setField(
            "committeeDate",
            committee.date
        );


        setField(
            "committeeTime",
            committee.time
        );


        setField(
            "committeeMode",
            committee.mode || "Online"
        );


        setField(
            "committeeVenue",
            committee.venue
        );


        setField(
            "committeeMeetingLink",
            committee.meetingLink
        );


        setField(
            "chairpersonName",
            committee.chairpersonName
        );


        setField(
            "chairpersonEmail",
            committee.chairpersonEmail
        );


        const modal =
            document.getElementById(
                "committeeModal"
            );


        if (modal) {

            modal.classList.remove(
                "hidden"
            );

        }

    } catch (error) {

        console.error(
            "Unable to load committee:",
            error
        );


        if (typeof Utils !== "undefined") {

            Utils.showToast(
                "Unable to load committee",
                "error"
            );

        }

    } finally {

        if (typeof Utils !== "undefined") {
            Utils.hideLoader();
        }

    }

}


/* =========================================================
   SAVE COMMITTEE
   ========================================================= */

async function saveCommittee(event) {

    event.preventDefault();


    const committee =
        collectCommitteeForm();


    try {

        if (typeof Utils !== "undefined") {
            Utils.showLoader();
        }


        if (
            CommitteeApp.editingCommitteeId
        ) {

            await apiRequest(
                "/committees/" +
                CommitteeApp.editingCommitteeId,
                "PUT",
                committee
            );


            if (typeof Utils !== "undefined") {

                Utils.showToast(
                    "Committee updated successfully",
                    "success"
                );

            }

        } else {

            await apiRequest(
                "/committees",
                "POST",
                committee
            );


            if (typeof Utils !== "undefined") {

                Utils.showToast(
                    "Committee created successfully",
                    "success"
                );

            }

        }


        closeCommitteeModal();

        await loadCommittees();

    } catch (error) {

        console.error(
            "Unable to save committee:",
            error
        );


        if (typeof Utils !== "undefined") {

            Utils.showToast(
                error.message ||
                "Unable to save committee",
                "error"
            );

        }

    } finally {

        if (typeof Utils !== "undefined") {
            Utils.hideLoader();
        }

    }

}


/* =========================================================
   COLLECT FORM
   ========================================================= */

function collectCommitteeForm() {

    return {

        name:
            getFieldValue(
                "committeeName"
            ),

        category:
            getFieldValue(
                "committeeCategory"
            ),

        description:
            getFieldValue(
                "committeeDescription"
            ),

        date:
            getFieldValue(
                "committeeDate"
            ),

        time:
            getFieldValue(
                "committeeTime"
            ),

        mode:
            getFieldValue(
                "committeeMode"
            ),

        venue:
            getFieldValue(
                "committeeVenue"
            ),

        meetingLink:
            getFieldValue(
                "committeeMeetingLink"
            ),

        chairpersonName:
            getFieldValue(
                "chairpersonName"
            ),

        chairpersonEmail:
            getFieldValue(
                "chairpersonEmail"
            )

    };

}


/* =========================================================
   VIEW COMMITTEE
   ========================================================= */

async function viewCommittee(id) {

    try {

        if (typeof Utils !== "undefined") {
            Utils.showLoader();
        }


        const committee =
            await apiRequest(
                "/committees/" + id
            );


        CommitteeApp.selectedCommittee =
            committee;


        renderDrawer(committee);

    } catch (error) {

        console.error(
            "Unable to load committee:",
            error
        );


        if (typeof Utils !== "undefined") {

            Utils.showToast(
                "Unable to load committee",
                "error"
            );

        }

    } finally {

        if (typeof Utils !== "undefined") {
            Utils.hideLoader();
        }

    }

}


/* =========================================================
   COMMITTEE DRAWER
   ========================================================= */

function renderDrawer(committee) {

    const content =
        document.getElementById(
            "drawerContent"
        );


    if (!content) {
        return;
    }


    const name =
        escapeHTML(
            committee.name ||
            "Unnamed Committee"
        );


    const category =
        escapeHTML(
            committee.category ||
            "General"
        );


    const description =
        escapeHTML(
            committee.description ||
            "No description available."
        );


    const chairperson =
        escapeHTML(
            committee.chairpersonName ||
            "-"
        );


    const email =
        escapeHTML(
            committee.chairpersonEmail ||
            "-"
        );


    const mode =
        escapeHTML(
            committee.mode ||
            "-"
        );


    const date =
        formatDate(
            committee.date
        );


    const time =
        escapeHTML(
            committee.time ||
            "-"
        );


    const venue =
        escapeHTML(
            committee.venue ||
            "-"
        );


    const meetingLink =
        committee.meetingLink || "";


    const meetingButton =
        meetingLink
            ? `
                <a
                    href="${escapeAttribute(
                        meetingLink
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="drawer-meeting-btn"
                >
                    Join Meeting
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              `
            : `
                <span class="drawer-no-link">
                    No meeting link available
                </span>
              `;


    content.innerHTML = `

        <div class="committee-drawer-header">

            <div>

                <span class="drawer-category">
                    ${category}
                </span>

                <h2>
                    ${name}
                </h2>

            </div>

        </div>


        <div class="committee-drawer-section">

            <h4>
                Description
            </h4>

            <p>
                ${description}
            </p>

        </div>


        <div class="committee-drawer-grid">

            <div class="drawer-info-card">

                <span class="drawer-label">
                    Chairperson
                </span>

                <strong>
                    ${chairperson}
                </strong>

            </div>


            <div class="drawer-info-card">

                <span class="drawer-label">
                    Mode
                </span>

                <strong>
                    ${mode}
                </strong>

            </div>


            <div class="drawer-info-card">

                <span class="drawer-label">
                    Date
                </span>

                <strong>
                    ${date}
                </strong>

            </div>


            <div class="drawer-info-card">

                <span class="drawer-label">
                    Time
                </span>

                <strong>
                    ${time}
                </strong>

            </div>

        </div>


        <div class="committee-drawer-section">

            <h4>
                Chairperson Contact
            </h4>

            <p>
                ${email}
            </p>

        </div>


        <div class="committee-drawer-section">

            <h4>
                Venue
            </h4>

            <p>
                ${venue}
            </p>

        </div>


        <div class="committee-drawer-section">

            <h4>
                Meeting
            </h4>

            ${meetingButton}

        </div>

    `;


    const drawer =
        document.getElementById(
            "detailsDrawer"
        );


    const overlay =
        document.getElementById(
            "drawerOverlay"
        );


    if (drawer) {

        drawer.classList.add(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.add(
            "show"
        );

    }

}


/* =========================================================
   CLOSE DRAWER
   ========================================================= */

function closeDrawer() {

    const drawer =
        document.getElementById(
            "detailsDrawer"
        );


    const overlay =
        document.getElementById(
            "drawerOverlay"
        );


    if (drawer) {

        drawer.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "show"
        );

    }


    CommitteeApp.selectedCommittee =
        null;

}


/* =========================================================
   DELETE COMMITTEE
   ========================================================= */

function deleteCommittee(id) {

    const committee =
        CommitteeApp.committees.find(
            item =>
                item.id === id
        );


    if (!committee) {

        if (typeof Utils !== "undefined") {

            Utils.showToast(
                "Committee not found",
                "error"
            );

        }

        return;

    }


    CommitteeApp.deletingCommitteeId =
        id;


    const name =
        document.getElementById(
            "deleteCommitteeName"
        );


    if (name) {

        name.textContent =
            committee.name;

    }


    const modal =
        document.getElementById(
            "deleteCommitteeModal"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   CLOSE DELETE MODAL
   ========================================================= */

function closeDeleteModal() {

    CommitteeApp.deletingCommitteeId =
        null;


    const modal =
        document.getElementById(
            "deleteCommitteeModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   CONFIRM DELETE
   ========================================================= */

async function confirmDeleteCommittee() {

    const id =
        CommitteeApp.deletingCommitteeId;


    if (!id) {
        return;
    }


    const button =
        document.getElementById(
            "confirmDeleteCommittee"
        );


    try {

        if (typeof Utils !== "undefined") {
            Utils.showLoader();
        }


        if (button) {
            button.disabled = true;
        }


        await apiRequest(
            "/committees/" + id,
            "DELETE"
        );


        if (typeof Utils !== "undefined") {

            Utils.showToast(
                "Committee deleted successfully",
                "success"
            );

        }


        closeDeleteModal();

        await loadCommittees();

    } catch (error) {

        console.error(
            "Unable to delete committee:",
            error
        );


        if (typeof Utils !== "undefined") {

            Utils.showToast(
                error.message ||
                "Unable to delete committee",
                "error"
            );

        }

    } finally {

        if (typeof Utils !== "undefined") {
            Utils.hideLoader();
        }


        if (button) {
            button.disabled = false;
        }

    }

}


/* =========================================================
   EXPORT COMMITTEES
   ========================================================= */

function exportCommittees() {

    const committees =
        CommitteeApp.filteredCommittees;


    if (!committees.length) {

        if (typeof Utils !== "undefined") {

            Utils.showToast(
                "There are no committees to export",
                "info"
            );

        }

        return;

    }


    const headers = [
        "Committee",
        "Category",
        "Chairperson",
        "Mode",
        "Date",
        "Time",
        "Venue",
        "Meeting Link",
        "Delegates",
        "Status"
    ];


    const rows =
        committees.map(
            committee => [

                csvValue(
                    committee.name
                ),

                csvValue(
                    committee.category
                ),

                csvValue(
                    committee.chairpersonName
                ),

                csvValue(
                    committee.mode
                ),

                csvValue(
                    committee.date
                ),

                csvValue(
                    committee.time
                ),

                csvValue(
                    committee.venue
                ),

                csvValue(
                    committee.meetingLink
                ),

                csvValue(
                    committee.delegateCount || 0
                ),

                "Active"

            ]
        );


    const csv =
        [
            headers.join(","),
            ...rows.map(
                row =>
                    row.join(",")
            )
        ].join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "fic-fury-committees.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    if (typeof Utils !== "undefined") {

        Utils.showToast(
            "Committee list exported successfully",
            "success"
        );

    }

}


/* =========================================================
   KEYBOARD HANDLING
   ========================================================= */

function handleKeyboard(event) {

    if (
        event.key !== "Escape"
    ) {
        return;
    }


    closeDrawer();

    closeCommitteeModal();

    closeDeleteModal();

}


/* =========================================================
   FIELD HELPERS
   ========================================================= */

function getFieldValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value.trim();

}


function setField(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value ?? "";

    }

}


/* =========================================================
   DATE FORMATTER
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "-";
    }


    try {

        if (
            typeof Utils !== "undefined" &&
            typeof Utils.formatDate === "function"
        ) {

            return Utils.formatDate(
                value
            );

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;

        }


        return date.toLocaleDateString(
            "en-US",
            {
                month: "numeric",
                day: "numeric",
                year: "numeric"
            }
        );

    } catch {

        return value;

    }

}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   ATTRIBUTE SAFETY
   ========================================================= */

function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


/* =========================================================
   CSV SAFETY
   ========================================================= */

function csvValue(value) {

    const text =
        String(
            value ?? ""
        );


    return `"${text.replace(
        /"/g,
        '""'
    )}"`;

}