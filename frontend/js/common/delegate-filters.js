/**
 * ============================================================
 * Delegate Filters
 * Shared by Admin & Chair pages
 * ============================================================
 */

function onSearch() {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {

        DelegateApp.filters.search =
            DOM.search.value
                .trim()
                .toLowerCase();

        applyFilters();

    }, 300);

}

function applyFilters() {

    DelegateApp.filters.committee =
        DOM.committeeFilter?.value || "";

    DelegateApp.filters.character =
        DOM.characterFilter?.value || "";

    DelegateApp.filters.status =
        DOM.statusFilter?.value || "";

    DelegateApp.filters.chairReview =
        DOM.chairReviewFilter?.value || "";

    DelegateApp.filters.sort =
        DOM.sortFilter?.value || "name";

    let delegates = [...DelegateApp.delegates];

    delegates = applySearchFilter(delegates);

    delegates = applyCommitteeFilter(delegates);

    delegates = applyCharacterFilter(delegates);

    delegates = applyWorkflowFilter(delegates);

    delegates = applyChairReviewFilter(delegates);

    delegates = applySorting(delegates);

    DelegateApp.filteredDelegates = delegates;

    DelegateApp.currentPage = 1;

    refreshView();

}

function applySearchFilter(delegates) {

    if (!DelegateApp.filters.search)
        return delegates;

    const search = DelegateApp.filters.search;

    return delegates.filter(delegate => {

        return (

            delegate.user?.fullName
                ?.toLowerCase()
                .includes(search)

            ||

            delegate.user?.email
                ?.toLowerCase()
                .includes(search)

            ||

            delegate.committee?.name
                ?.toLowerCase()
                .includes(search)

            ||

            delegate.character?.name
                ?.toLowerCase()
                .includes(search)

        );

    });

}
function applyCommitteeFilter(delegates) {

    if (!DelegateApp.filters.committee)
        return delegates;

    return delegates.filter(delegate =>

        String(delegate.committee?.id) ===
        DelegateApp.filters.committee

    );

}
function applyCharacterFilter(delegates) {

    if (!DelegateApp.filters.character)
        return delegates;

    return delegates.filter(delegate =>

        String(delegate.character?.id) ===
        DelegateApp.filters.character

    );

}
function applyWorkflowFilter(delegates) {

    if (!DelegateApp.filters.status)
        return delegates;

    return delegates.filter(delegate =>

        delegate.workflowStatus ===
        DelegateApp.filters.status

    );

}
function applyWorkflowFilter(delegates) {

    if (!DelegateApp.filters.status)
        return delegates;

    return delegates.filter(delegate =>

        delegate.workflowStatus ===
        DelegateApp.filters.status

    );

}
function applyChairReviewFilter(delegates) {

    if (!DelegateApp.filters.chairReview)
        return delegates;

    return delegates.filter(delegate =>

        delegate.chairApproval ===
        DelegateApp.filters.chairReview

    );

}
async function loadCommittees() {

    try {

        DelegateApp.committees =
            await CommitteeAPI.getAll();

        populateCommitteeFilter();

    }

    catch (error) {

        handleError(error);

    }

}
async function loadCommittees() {

    try {

        DelegateApp.committees =
            await CommitteeAPI.getAll();

        populateCommitteeFilter();

    }

    catch (error) {

        handleError(error);

    }

}
function populateCommitteeFilter() {

    if (!DOM.committeeFilter)
        return;

    DOM.committeeFilter.innerHTML =
        '<option value="">All Committees</option>';

    DelegateApp.committees.forEach(committee => {

        const option =
            document.createElement("option");

        option.value = committee.id;

        option.textContent = committee.name;

        DOM.committeeFilter.appendChild(option);

    });

}
async function loadCharacters() {

    try {

        DelegateApp.characters =
            await CharacterAPI.getAll();

        populateCharacterFilter();

    }

    catch (error) {

        handleError(error);

    }

}
function populateCharacterFilter(){

    if(!DOM.characterFilter)
        return;

    DOM.characterFilter.innerHTML =
        '<option value="">All Characters</option>';

    DelegateApp.characters.forEach(character=>{

        const option =
            document.createElement("option");

        option.value =
            character.id;

        option.textContent =
            character.name;

        DOM.characterFilter.appendChild(option);

    });

}
