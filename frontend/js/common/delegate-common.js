/**
 * ============================================================
 * Delegate Common Module
 * Shared State, Utilities and Rendering
 * Used by:
 *      - Admin Delegate Management
 *      - Chair Delegate Management
 * ============================================================
 */

const DelegateApp = {

    delegates: [],
    committees: [],
    characters: [],
    filteredDelegates: [],

    selectedDelegate: null,

    currentPage: 1,

    pageSize: 10,

    filters: {

        search: "",

        committee: "",

        character: "",

        status: "",

        chairReview: "",

        sort: "name"

    }

};

const DOM = {};

let searchTimeout = null;
function cacheDom() {

    DOM.search = document.getElementById("delegateSearch");

    DOM.committeeFilter =
        document.getElementById("committeeFilter");

    DOM.characterFilter =
        document.getElementById("characterFilter");

    DOM.statusFilter =
        document.getElementById("statusFilter");

    DOM.chairReviewFilter =
        document.getElementById("chairReviewFilter");

    DOM.sortFilter =
        document.getElementById("sortFilter");

    DOM.exportBtn =
        document.getElementById("exportDelegates");

    DOM.tableBody =
        document.getElementById("delegateTableBody");

    DOM.pagination =
        document.getElementById("pagination");

    DOM.emptyState =
        document.getElementById("emptyState");

    DOM.drawer =
        document.getElementById("delegateDrawer");

    DOM.closeDrawer =
        document.getElementById("closeDrawer");

    DOM.loading =
        document.getElementById("loadingOverlay");

}
function registerCommonEvents() {

    DOM.search?.addEventListener(
        "input",
        onSearch
    );

    DOM.committeeFilter?.addEventListener(
        "change",
        applyFilters
    );

    DOM.characterFilter?.addEventListener(
        "change",
        applyFilters
    );

    DOM.statusFilter?.addEventListener(
        "change",
        applyFilters
    );

    DOM.chairReviewFilter?.addEventListener(
        "change",
        applyFilters
    );

    DOM.sortFilter?.addEventListener(
        "change",
        applyFilters
    );

    DOM.exportBtn?.addEventListener(
        "click",
        exportDelegates
    );

    DOM.closeDrawer?.addEventListener(
        "click",
        closeDrawer
    );

}
function setLoading(show) {

    if (!DOM.loading)
        return;

    DOM.loading.classList.toggle(
        "hidden",
        !show
    );

}
function handleError(error) {

    console.error(error);

    showToast(

        error?.message ||

        "Unexpected error occurred",

        "error"

    );

}
function getInitials(name) {

    if (!name)
        return "?";

    return name

        .split(" ")

        .map(x => x[0])

        .join("")

        .substring(0, 2)

        .toUpperCase();

}
function renderStatistics() {

    const total = DelegateApp.delegates.length;

    const pending = DelegateApp.delegates.filter(

        d => d.workflowStatus === "PENDING_CHAIR"

    ).length;

    const active = DelegateApp.delegates.filter(

        d => d.workflowStatus === "ACTIVE"

    ).length;

    const rejected = DelegateApp.delegates.filter(

        d => d.workflowStatus === "REJECTED"

    ).length;

    document.getElementById("totalDelegates").textContent =
        total;

    document.getElementById("pendingDelegates").textContent =
        pending;

    document.getElementById("approvedDelegates").textContent =
        active;

    document.getElementById("rejectedDelegates").textContent =
        rejected;

}
function toggleEmptyState() {

    if (!DOM.emptyState)
        return;

    DOM.emptyState.classList.toggle(

        "hidden",

        DelegateApp.filteredDelegates.length > 0

    );

}
function renderTable() {

    DOM.tableBody.innerHTML = "";

    toggleEmptyState();

    getCurrentPageData()

        .forEach(delegate => {

            DOM.tableBody.appendChild(

                createDelegateRow(delegate)

            );

        });

}
function refreshView() {

    applyFilters();

    renderStatistics();

    renderTable();

}
async function initializeCommon() {

    cacheDom();

    registerCommonEvents();

    await Promise.all([

        loadCommittees(),

        loadCharacters()

    ]);

}
function getCurrentPageData(){

    const start =

        (DelegateApp.currentPage-1)

        * DelegateApp.pageSize;

    const end =

        start +

        DelegateApp.pageSize;

    return DelegateApp.filteredDelegates.slice(

        start,

        end

    );

}