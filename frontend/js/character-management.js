/*=========================================================
    FIC FURY
    CHARACTER MANAGEMENT
=========================================================*/

"use strict";

/*=========================================================
    APPLICATION STATE
=========================================================*/

const CharacterApp = {

    characters: [],

    committees: [],

    filteredCharacters: [],

    selectedCharacter: null,

    editingCharacterId: null,

    deletingCharacterId: null,

    currentPage: 1,

    pageSize: 8,

    filters: {

        search: "",

        committee: "",

        difficulty: "",

        faction: "",

        sort: "name"

    }

};

let searchTimeout = null;
/*=========================================================
    DOM CACHE
=========================================================*/

const DOM = {

    /* Statistics */

    characterCount: null,
    committeeCount: null,
    factionCount: null,
    hardCharacterCount: null,

    /* Table */

    tableBody: null,
    pagination: null,
    emptyState: null,

    /* Filters */

    search: null,
    committeeFilter: null,
    difficultyFilter: null,
    factionFilter: null,
    sortFilter: null,

    /* Toolbar */

    newButton: null,
    refreshButton: null,
    exportButton: null,

    /* Drawer */

    drawer: null,

    /* Character Modal */

    characterModal: null,

    /* Delete Modal */

    deleteModal: null,

    /* Loading */

    loadingOverlay: null


    

};
/*=========================================================
    INITIALIZATION
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    initializeCharacterPage
);

async function initializeCharacterPage(){

    try{

        if(!Auth.isLoggedIn()){

            Utils.redirect("login.html");
            return;

        }

        cacheDom();

        registerEvents();

        await initializePage();

    }

    catch(error){

        handleError(error);

    }

}
/*=========================================================
    CACHE DOM
=========================================================*/

function cacheDom(){

    /* Statistics */

    DOM.characterCount =
        document.getElementById("characterCount");

    DOM.committeeCount =
        document.getElementById("committeeCount");

    DOM.factionCount =
        document.getElementById("factionCount");

    DOM.hardCharacterCount =
        document.getElementById("hardCharacterCount");

    /* Table */

    DOM.tableBody =
        document.getElementById("characterTableBody");

    DOM.pagination =
        document.getElementById("pagination");

    DOM.emptyState =
        document.getElementById("emptyState");

    /* Filters */

    DOM.search =
        document.getElementById("characterSearch");

    DOM.committeeFilter =
        document.getElementById("committeeFilter");

    DOM.difficultyFilter =
        document.getElementById("difficultyFilter");

    DOM.factionFilter =
        document.getElementById("factionFilter");

    DOM.sortFilter =
        document.getElementById("sortFilter");

    /* Toolbar */

    DOM.newButton =
        document.getElementById("newCharacterBtn");

    DOM.refreshButton =
        document.getElementById("refreshCharacters");

    DOM.exportButton =
        document.getElementById("exportCharacters");

    /* Drawer */

    DOM.drawer =
        document.getElementById("characterDrawer");

    /* Modals */

    DOM.characterModal =
        document.getElementById("characterModal");

    DOM.deleteModal =
        document.getElementById("deleteModal");

    /* Loading */

    DOM.loadingOverlay =
        document.getElementById("loadingOverlay");


DOM.name = document.getElementById("name")
DOM.title = document.getElementById("title")
DOM.committee = document.getElementById("committee")
DOM.description = document.getElementById("description")

}
/*=========================================================
    REGISTER EVENTS
=========================================================*/

function registerEvents(){


      console.log("registerEvents called");

    DOM.search?.addEventListener(
        "input",
        onSearch
    );

    DOM.committeeFilter?.addEventListener(
        "change",
        onCommitteeFilter
    );

    DOM.difficultyFilter?.addEventListener(
        "change",
        onDifficultyFilter
    );

    DOM.factionFilter?.addEventListener(
        "change",
        onFactionFilter
    );

    DOM.sortFilter?.addEventListener(
        "change",
        onSort
    );

    DOM.newButton?.addEventListener(
        "click",
        openCreateModal
    );


console.log("Create listener attached");

    DOM.refreshButton?.addEventListener(
        "click",
        refreshData
    );

    DOM.exportButton?.addEventListener(
        "click",
        exportCharacters
    );

    document
        .getElementById("saveCharacterBtn")
        ?.addEventListener(
            "click",
            saveCharacter
        );

    document
        .getElementById("cancelCharacterBtn")
        ?.addEventListener(
            "click",
            closeCharacterModal
        );

    document
        .getElementById("confirmDeleteCharacter")
        ?.addEventListener(
            "click",
            confirmDeleteCharacter
        );

    document
        .getElementById("cancelDeleteCharacter")
        ?.addEventListener(
            "click",
            closeDeleteModal
        );

    document
        .getElementById("closeDrawer")
        ?.addEventListener(
            "click",
            closeDrawer
        );

    document.addEventListener(
        "keydown",
        handleKeyboardShortcuts
    );

    document.querySelector(".close-modal")
    ?.addEventListener(
        "click",
        closeCharacterModal
    );
    DOM.characterModal.addEventListener("click", (event) => {

    if (event.target === DOM.characterModal) {

        closeCharacterModal();

    }

});

    
    // DOM.exportButton?.addEventListener(
//     "click",
//     exportCharacters
// );

// document.addEventListener(
//     "keydown",
//     handleKeyboardShortcuts
// );
}

/*=========================================================
    PAGE INITIALIZATION
=========================================================*/

async function initializePage(){

    try{

        setLoading(true);

        await Promise.all([

            loadCommittees(),

            loadCharacters()

        ]);

    }

    catch(error){

    console.error("Initialization failed:", error);

}

    finally{

        setLoading(false);

    }

}
/*=========================================================
    REFRESH DATA
=========================================================*/

async function refreshData(){

    resetFilters();

    CharacterApp.currentPage = 1;

    await initializePage();

    Utils.showToast(
        "Characters refreshed successfully",
        "success"
    );

}
/*=========================================================
    LOAD COMMITTEES
=========================================================*/

async function loadCommittees() {

    try {

        const response = await apiRequest("/committees");

        console.log("Raw response:", response);

        CharacterApp.committees =
            Array.isArray(response)
                ? response
                : response.data || [];

        console.log("Loaded committees:", CharacterApp.committees);

        populateCommitteeFilters();

    } catch (error) {

        console.error(error);

    }

}
async function loadCharacters(){

    const response =
        await apiRequest("/characters");

    CharacterApp.characters =

        Array.isArray(response)

        ? response

        : response.data || [];

    CharacterApp.filteredCharacters =

        [...CharacterApp.characters];

    populateDifficultyFilter();

    populateFactionFilter();

    

    applyFilters();

}

/*=========================================================
    APPLY FILTERS
=========================================================*/

function applyFilters(){

    let characters = [...CharacterApp.characters];

    const {

        search,
        committee,
        difficulty,
        faction

    } = CharacterApp.filters;

    if(search){

        characters = characters.filter(character => {

            return (

                (character.name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (character.title || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (character.description || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (character.background || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (character.objectives || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (character.faction || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (character.committee?.name || "")
                    .toLowerCase()
                    .includes(search)

            );

        });

    }

    if(committee){

        characters = characters.filter(

            c =>

            String(c.committee?.id) === committee

        );

    }

    if(difficulty){

        characters = characters.filter(

            c =>

            c.difficulty === difficulty

        );

    }

    if(faction){

        characters = characters.filter(

            c =>

            c.faction === faction

        );

    }

    CharacterApp.filteredCharacters = characters;

    applySorting();

    validateCurrentPage();

    renderPage();

}
/*=========================================================
    POPULATE COMMITTEES
=========================================================*/

function populateCommitteeFilters(){

    const filter =
        document.getElementById("committeeFilter");

    const modal =
        document.getElementById("committee");

    const options = CharacterApp.committees.map(c =>

        `<option value="${c.id}">
            ${c.name}
        </option>`

    ).join("");

    if(filter){

        filter.innerHTML =

            `<option value="">
                All Committees
            </option>` + options;

    }

    if(modal){

        modal.innerHTML =

            `<option value="">
                Select Committee
            </option>` + options;

    }

}
/*=========================================================
    DIFFICULTY FILTER OPTIONS
=========================================================*/

function populateDifficultyFilter(){

    if(!DOM.difficultyFilter){

        return;

    }

    const values = [

        ...new Set(

            CharacterApp.characters

                .map(c => c.difficulty)

                .filter(Boolean)

        )

    ].sort();

    DOM.difficultyFilter.innerHTML =

        `<option value="">
            All Difficulties
        </option>`;

    values.forEach(value=>{

        DOM.difficultyFilter.innerHTML +=

            `<option value="${value}">
                ${value}
            </option>`;

    });

}
/*=========================================================
    FACTION FILTER OPTIONS
=========================================================*/

function populateFactionFilter(){

    if(!DOM.factionFilter){

        return;

    }

    const values = [

        ...new Set(

            CharacterApp.characters

                .map(c => c.faction)

                .filter(Boolean)

        )

    ].sort();

    DOM.factionFilter.innerHTML =

        `<option value="">
            All Factions
        </option>`;

    values.forEach(value=>{

        DOM.factionFilter.innerHTML +=

            `<option value="${value}">
                ${value}
            </option>`;

    });

}
/*=========================================================
    LOADING
=========================================================*/

function setLoading(isLoading){

    if(!DOM.loadingOverlay){

        return;

    }

    DOM.loadingOverlay.classList.toggle(

        "hidden",

        !isLoading

    );

}
/*=========================================================
    RENDER PAGE
=========================================================*/

function renderPage(){

    renderStatistics();

    renderCharacterTable();

    renderPagination();

    renderEmptyState();

}
/*=========================================================
    STATISTICS
=========================================================*/

function renderStatistics(){

    if(DOM.characterCount){

        DOM.characterCount.textContent =
            CharacterApp.characters.length;

    }

    if(DOM.committeeCount){

        DOM.committeeCount.textContent =
            CharacterApp.committees.length;

    }

    if(DOM.factionCount){

        const factions = new Set(

            CharacterApp.characters
                .map(c => c.faction)
                .filter(Boolean)

        );

        DOM.factionCount.textContent =
            factions.size;

    }

    if(DOM.hardCharacterCount){

        DOM.hardCharacterCount.textContent =

            CharacterApp.characters.filter(

                c => c.difficulty === "Hard"

            ).length;

    }

}


/*=========================================================
    SORTING
=========================================================*/

function applySorting(){

    const sort = CharacterApp.filters.sort;

    CharacterApp.filteredCharacters.sort((a,b)=>{

        switch(sort){

            case "committee":

                return (a.committee?.name || "")

                    .localeCompare(

                        b.committee?.name || ""

                    );

            case "difficulty":

                return (a.difficulty || "")

                    .localeCompare(

                        b.difficulty || ""

                    );

            case "faction":

                return (a.faction || "")

                    .localeCompare(

                        b.faction || ""

                    );

            default:

                return (a.name || "")

                    .localeCompare(

                        b.name || ""

                    );

        }

    });

}
/*=========================================================
    CHARACTER TABLE
=========================================================*/

function renderCharacterTable(){

    if(!DOM.tableBody){

        return;

    }

    DOM.tableBody.innerHTML = "";

    const start =

        (CharacterApp.currentPage - 1)

        * CharacterApp.pageSize;

    const end =

        start + CharacterApp.pageSize;

    const pageCharacters =

        CharacterApp.filteredCharacters.slice(

            start,

            end

        );

    pageCharacters.forEach(character => {

        DOM.tableBody.appendChild(

            createCharacterRow(character)

        );

    });

}
/*=========================================================
    TABLE ROW
=========================================================*/

function createCharacterRow(character){

    const row = document.createElement("tr");

    row.innerHTML = `

<td>

<div class="character-info">

<div class="character-avatar">

${getInitials(character.name)}

</div>

<div>

<div class="character-name">

${safe(character.name)}

</div>

<div class="character-title">

${safe(character.title)}

</div>

</div>

</div>

</td>

<td>${safe(character.committee?.name)}</td>

<td>

${createDifficultyBadge(character.difficulty)}

</td>

<td>${safe(character.faction)}</td>

<td>

<div class="action-buttons">

<button class="action-btn view">

<i class="fa-solid fa-eye"></i>

</button>

<button class="action-btn edit">

<i class="fa-solid fa-pen"></i>

</button>

<button class="action-btn delete">

<i class="fa-solid fa-trash"></i>

</button>

</div>

</td>

`;

    row.querySelector(".view")

        .onclick =

        () => viewCharacter(character.id);

    row.querySelector(".edit")

        .onclick =

        () => editCharacter(character.id);

    row.querySelector(".delete")

        .onclick =

        () => deleteCharacter(character.id);

    return row;

}
/*=========================================================
    DIFFICULTY BADGE
=========================================================*/

function createDifficultyBadge(level){

    const css = {

        Easy: "easy",

        Medium: "medium",

        Hard: "hard"

    };

    return `

<span class="badge ${css[level] || ""}">

${safe(level)}

</span>

`;

}
/*=========================================================
    EMPTY STATE
=========================================================*/

function renderEmptyState(){

    if(!DOM.emptyState){

        return;

    }

    DOM.emptyState.classList.toggle(

        "hidden",

        CharacterApp.filteredCharacters.length !== 0

    );

}
/*=========================================================
    PAGINATION
=========================================================*/

function renderPagination(){

    if(!DOM.pagination){

        return;

    }

    DOM.pagination.innerHTML = "";

    const totalPages = Math.ceil(

        CharacterApp.filteredCharacters.length /

        CharacterApp.pageSize

    );

    if(totalPages <= 1){

        return;

    }

    for(

        let page = 1;

        page <= totalPages;

        page++

    ){

        const button =

            document.createElement("button");

        button.textContent = page;

        if(page === CharacterApp.currentPage){

            button.classList.add("active");

        }

        button.onclick = () => {

            CharacterApp.currentPage = page;

            renderCharacterTable();

            renderPagination();

        };

        DOM.pagination.appendChild(button);

    }

}
/*=========================================================
    HELPERS
=========================================================*/

function validateCurrentPage(){

    const total = Math.max(

        1,

        Math.ceil(

            CharacterApp.filteredCharacters.length /

            CharacterApp.pageSize

        )

    );

    CharacterApp.currentPage =

        Math.min(

            CharacterApp.currentPage,

            total

        );

}

function getInitials(name){

    if(!name){

        return "?";

    }

    return name

        .split(" ")

        .map(word => word[0])

        .join("")

        .substring(0,2)

        .toUpperCase();

}

function safe(value){

    return value || "-";

}
/*=========================================================
    CREATE CHARACTER
=========================================================*/

function openCreateModal() {
    console.log("Create button clicked");
    CharacterApp.editingCharacterId = null;

    document.getElementById("saveCharacterBtn").textContent =
    "Create Character";
    document.getElementById("characterModalTitle").textContent =
    "Create Character";
    document.getElementById("characterForm").reset();

    DOM.characterModal.classList.remove("hidden");

}
/*=========================================================
    CLOSE CHARACTER MODAL
=========================================================*/

function closeCharacterModal() {

    DOM.characterModal.classList.add("hidden");

    CharacterApp.editingCharacterId = null;

    document.getElementById("characterForm").reset();

}
/*=========================================================
    EDIT CHARACTER
=========================================================*/

function editCharacter(id) {

    const character = CharacterApp.characters.find(

        c => c.id === id

    );

    if (!character) {

        Utils.showToast(

            "Character not found",

            "error"

        );

        return;

    }

    CharacterApp.editingCharacterId = id;
    document.getElementById("saveCharacterBtn").textContent =
    "Update Character";
    document.getElementById("characterModalTitle").textContent =
        "Edit Character";

    document.getElementById("name").value =
        character.name || "";

    document.getElementById("title").value =
        character.title || "";

    document.getElementById("committee").value =
        character.committee?.id || "";

    document.getElementById("difficulty").value =
        character.difficulty || "";

    document.getElementById("faction").value =
        character.faction || "";

    document.getElementById("description").value =
        character.description || "";

    document.getElementById("background").value =
        character.background || "";

    document.getElementById("objectives").value =
        character.objectives || "";

    DOM.characterModal.classList.remove("hidden");

}
/*=========================================================
    SAVE CHARACTER
=========================================================*/

async function saveCharacter() {

    try {

        const character = {

            name:
                document.getElementById("name").value.trim(),

            title:
                document.getElementById("title").value.trim(),

            difficulty:
                document.getElementById("difficulty").value,

            faction:
                document.getElementById("faction").value.trim(),

            description:
                document.getElementById("description").value.trim(),

            background:
                document.getElementById("background").value.trim(),

            objectives:
                document.getElementById("objectives").value.trim(),

            committee: {

                id: Number(

                    document.getElementById("committee").value

                )

            }

        };

        validateCharacter(character);

        setLoading(true);

        if (CharacterApp.editingCharacterId) {

           await apiRequest(
    `/characters/${CharacterApp.editingCharacterId}`,
    "PUT",
    character
);
            Utils.showToast(

                "Character updated successfully",

                "success"

            );

        } else {

          await apiRequest(
    "/characters",
    "POST",
    character
);

            Utils.showToast(

                "Character created successfully",

                "success"

            );

        }

        closeCharacterModal();

        await loadCharacters();

    }

    catch (error) {

        handleError(error);

    }

    finally {

        setLoading(false);

    }

}
/*=========================================================
    VIEW CHARACTER
=========================================================*/

function viewCharacter(id) {

    const character = CharacterApp.characters.find(

        c => c.id === id

    );

    if (!character) {

        Utils.showToast(

            "Character not found",

            "error"

        );

        return;

    }

    CharacterApp.selectedCharacter = character;

    renderCharacterDrawer(character);

    DOM.drawer.classList.add("open");
    closeDeleteModal();
    closeDrawer();

}
/*=========================================================
    DRAWER
=========================================================*/

function renderCharacterDrawer(character) {

    document.getElementById("drawerName").textContent =
        character.name || "-";

    document.getElementById("drawerTitle").textContent =
        character.title || "-";

    document.getElementById("drawerCommittee").textContent =
        character.committee?.name || "-";

    document.getElementById("drawerDifficulty").textContent =
        character.difficulty || "-";

    document.getElementById("drawerFaction").textContent =
        character.faction || "-";

    document.getElementById("drawerDescription").textContent =
        character.description || "-";

    document.getElementById("drawerBackground").textContent =
        character.background || "-";

    document.getElementById("drawerObjectives").textContent =
        character.objectives || "-";

}
/*=========================================================
    CLOSE DRAWER
=========================================================*/

function closeDrawer() {

    DOM.drawer.classList.remove("open");

    CharacterApp.selectedCharacter = null;

}
/*=========================================================
    DELETE CHARACTER
=========================================================*/

function deleteCharacter(id) {

    CharacterApp.deletingCharacterId = id;

    DOM.deleteModal.classList.remove("hidden");

}
/*=========================================================
    CLOSE DELETE MODAL
=========================================================*/

function closeDeleteModal() {

    DOM.deleteModal.classList.add("hidden");

    CharacterApp.deletingCharacterId = null;

}
/*=========================================================
    CONFIRM DELETE
=========================================================*/

async function confirmDeleteCharacter() {

    if (!CharacterApp.deletingCharacterId) {

        return;

    }

    try {

        setLoading(true);

        await apiRequest(

            `/characters/${CharacterApp.deletingCharacterId}`,

            "DELETE"

        );

        Utils.showToast(

            "Character deleted successfully",

            "success"

        );

        closeDeleteModal();

        await loadCharacters();

    }

    catch (error) {

        handleError(error);

    }

    finally {

        setLoading(false);

    }

}
/*=========================================================
    VALIDATION
=========================================================*/

function validateCharacter(character) {

    if (!character.name) {

        throw new Error("Character name is required.");

    }

    if (!character.title) {

        throw new Error("Character title is required.");

    }

    if (!character.committee.id) {

        throw new Error("Please select a committee.");

    }

    if (!character.difficulty) {

        throw new Error("Please select difficulty.");

    }

}
function handleError(error) {

    console.error(error);

    Utils.showToast?.(

        error.message || "Unexpected error",

        "error"

    );

}
/*=========================================================
    SEARCH
=========================================================*/

function onSearch(event) {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {

        CharacterApp.filters.search =
            event.target.value.trim().toLowerCase();

        CharacterApp.currentPage = 1;

        applyFilters();

    }, 300);

}
/*=========================================================
    COMMITTEE FILTER
=========================================================*/

function onCommitteeFilter(event) {

    CharacterApp.filters.committee =
        event.target.value;

    CharacterApp.currentPage = 1;

    applyFilters();

}
/*=========================================================
    DIFFICULTY FILTER
=========================================================*/

function onDifficultyFilter(event) {

    CharacterApp.filters.difficulty =
        event.target.value;

    CharacterApp.currentPage = 1;

    applyFilters();

}
/*=========================================================
    FACTION FILTER
=========================================================*/

function onFactionFilter(event) {

    CharacterApp.filters.faction =
        event.target.value;

    CharacterApp.currentPage = 1;

    applyFilters();

}
/*=========================================================
    SORT
=========================================================*/

function onSort(event) {

    CharacterApp.filters.sort =
        event.target.value;

    applyFilters();

}
/*=========================================================
    RESET FILTERS
=========================================================*/

function resetFilters() {

    CharacterApp.filters = {

        search: "",

        committee: "",

        difficulty: "",

        faction: "",

        sort: "name"

    };

    CharacterApp.currentPage = 1;

    DOM.search.value = "";

    DOM.committeeFilter.value = "";

    DOM.difficultyFilter.value = "";

    DOM.factionFilter.value = "";

    DOM.sortFilter.value = "name";

}
/*=========================================================
    EXPORT CSV
=========================================================*/

function exportCharacters() {

    if (!CharacterApp.filteredCharacters.length) {

        Utils.showToast(

            "No characters available.",

            "warning"

        );

        return;

    }

    const rows = [

        [

            "Name",

            "Title",

            "Committee",

            "Difficulty",

            "Faction"

        ]

    ];

    CharacterApp.filteredCharacters.forEach(character => {

        rows.push([

            character.name || "",

            character.title || "",

            character.committee?.name || "",

            character.difficulty || "",

            character.faction || ""

        ]);

    });

    const csv = rows

        .map(row =>

            row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")

        )

        .join("\n");

    const blob = new Blob(

        [csv],

        {

            type: "text/csv"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "characters.csv";

    a.click();

    URL.revokeObjectURL(url);

}
/*=========================================================
    KEYBOARD SHORTCUTS
=========================================================*/

function handleKeyboardShortcuts(event) {

    if (event.key === "Escape") {

        closeCharacterModal();

        closeDeleteModal();

        closeDrawer();

    }

    if (event.ctrlKey && event.key.toLowerCase() === "n") {

        event.preventDefault();

        openCreateModal();

    }

}

