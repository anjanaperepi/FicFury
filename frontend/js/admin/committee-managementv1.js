/*=========================================================
    COMMITTEE MANAGEMENT
=========================================================*/

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

document.addEventListener(
    "DOMContentLoaded",
    initializeCommitteePage
);

async function initializeCommitteePage(){

    if(!Auth.isLoggedIn()){

        Utils.redirect("login.html");
        return;

    }

    registerEvents();

    await loadCommittees();

}
function registerEvents(){

    document
        .getElementById("committeeSearch")
        .addEventListener("input", onSearch);

    document
        .getElementById("modeFilter")
        .addEventListener("change", onModeFilter);

    document
        .getElementById("categoryFilter")
        .addEventListener("change", onCategoryFilter);

    document
        .getElementById("sortFilter")
        .addEventListener("change", onSort);

    document
        .getElementById("refreshCommittees")
        .addEventListener("click", loadCommittees);

    document
        .getElementById("newCommitteeBtn")
        .addEventListener("click", openCreateModal);
    document
    .getElementById("exportCommittees")
    .addEventListener(
        "click",
        exportCommittees
    );
    document

    .getElementById("cancelDeleteCommittee")

    .addEventListener(

        "click",

        closeDeleteModal

    );

document

    .getElementById("confirmDeleteCommittee")

    .addEventListener(

        "click",

        confirmDeleteCommittee

    );
}

async function loadCommittees(){

    try{

        Utils.showLoader();

        const response =
    await apiRequest("/committees");

CommitteeApp.committees =

    Array.isArray(response)

        ? response

        : response.data || [];

        CommitteeApp.filteredCommittees = [
            ...CommitteeApp.committees
        ];

        populateCategoryFilter();

        renderPage();

    }

    catch(error){

        console.error(error);

        Utils.showToast(
            "Unable to load committees",
            "error"
        );

    }

    finally{

        Utils.hideLoader();

    }

}
function renderPage(){

    renderStatistics();

    renderCommitteeTable();

    renderPagination();

    renderEmptyState();

}
function renderStatistics(){

    const committees =
        CommitteeApp.filteredCommittees;

    document.getElementById("committeeCount").textContent =
        committees.length;

    document.getElementById("chairCount").textContent =
        committees.filter(c => c.chairpersonName).length;

    document.getElementById("sessionCount").textContent =
        committees.length;

    const totalDelegates =
        committees.reduce(
            (sum, committee) =>
                sum + (committee.delegateCount || 0),
            0
        );

    document.getElementById("delegateCount").textContent =
        totalDelegates;

    document.getElementById("committeeTotal").textContent =
        `${committees.length} Committees`;

}
function renderCommitteeTable(){

    const tbody =
        document.getElementById(
            "committeeTableBody"
        );

    tbody.innerHTML = "";

    const start =
        (CommitteeApp.currentPage-1) *
        CommitteeApp.pageSize;

    const end =
        start +
        CommitteeApp.pageSize;

    const committees =
        CommitteeApp.filteredCommittees.slice(
            start,
            end
        );

    committees.forEach(c=>{

        tbody.appendChild(
            createCommitteeRow(c)
        );

    });

}
function createCommitteeRow(committee){

    const row =
        document.createElement("tr");

    row.innerHTML = `

<td>

<strong>${committee.name}</strong>

<br>

<small>${committee.category ?? "General"}</small>

</td>

<td>

${committee.chairpersonName ?? "-"}

</td>

<td>

<span class="badge badge-info">

${committee.mode}

</span>

</td>

<td>

${Utils.formatDate(committee.date)}

</td>

<td>

${committee.delegateCount ?? 0}

</td>

<td>

<span class="badge badge-success">

Active

</span>

</td>

<td>

<div class="action-buttons">

<button class="btn btn-primary btn-sm view-btn">

<i class="fa-solid fa-eye"></i>

</button>

<button class="btn btn-warning btn-sm edit-btn">

<i class="fa-solid fa-pen"></i>

</button>

<button class="btn btn-danger btn-sm delete-btn">

<i class="fa-solid fa-trash"></i>

</button>

</div>

</td>

`;

    row.querySelector(".view-btn")
        .onclick =
        ()=>viewCommittee(committee.id);

    row.querySelector(".edit-btn")
        .onclick =
        ()=>editCommittee(committee.id);

    row.querySelector(".delete-btn")
        .onclick =
        ()=>deleteCommittee(committee.id);

    return row;

}
function onSearch(event){

    CommitteeApp.filters.search =
        event.target.value.trim().toLowerCase();

    CommitteeApp.currentPage = 1;

    applyFilters();

}
function onModeFilter(event){

    CommitteeApp.filters.mode =
        event.target.value;

    CommitteeApp.currentPage = 1;

    applyFilters();

}

function onCategoryFilter(event){

    CommitteeApp.filters.category =
        event.target.value;

    CommitteeApp.currentPage = 1;

    applyFilters();


}
function onSort(event){

    CommitteeApp.filters.sort =
        event.target.value;

    applyFilters();

}
function populateCategoryFilter(){

    const select =
        document.getElementById("categoryFilter");

    const categories = [

        ...new Set(

            CommitteeApp.committees

                .map(c => c.category)

                .filter(Boolean)

        )

    ].sort();

    select.innerHTML =

        `<option value="">All Categories</option>`;

    categories.forEach(category =>{

        select.innerHTML +=

            `<option value="${category}">

                ${category}

             </option>`;

    });

}
function applyFilters(){

    let committees = [...CommitteeApp.committees];

    /* Search */

    if(CommitteeApp.filters.search){

        const keyword =
            CommitteeApp.filters.search;

        committees = committees.filter(c =>

            (c.name ?? "")
                .toLowerCase()
                .includes(keyword)

            ||

            (c.chairpersonName ?? "")
                .toLowerCase()
                .includes(keyword)

            ||

            (c.category ?? "")
                .toLowerCase()
                .includes(keyword)

        );

    }

    /* Mode */

    if(CommitteeApp.filters.mode){

        committees = committees.filter(

            c => c.mode ===
                CommitteeApp.filters.mode

        );

    }

    /* Category */

    if(CommitteeApp.filters.category){

        committees = committees.filter(

            c => c.category ===
                CommitteeApp.filters.category

        );

    }

    sortCommittees(committees);

    CommitteeApp.filteredCommittees =
    committees;

const totalPages = Math.max(
    1,
    Math.ceil(
        committees.length /
        CommitteeApp.pageSize
    )
);

CommitteeApp.currentPage = Math.min(
    CommitteeApp.currentPage,
    totalPages
);

renderPage();

}
function sortCommittees(committees){

    switch(CommitteeApp.filters.sort){

        case "name":

            committees.sort(

                (a,b)=>

                (a.name ?? "")
                    .localeCompare(b.name ?? "")

            );

            break;

        case "date":

            committees.sort(

                (a,b)=>

                new Date(a.date) -

                new Date(b.date)

            );

            break;

        default:

            break;

    }

}
function renderEmptyState(){

    const empty =
        document.getElementById("emptyState");

    if(!empty){

        return;

    }

    if(CommitteeApp.filteredCommittees.length===0){

        empty.classList.remove("hidden");

    }

    else{

        empty.classList.add("hidden");

    }

}
function renderPagination(){

    const pagination =
        document.getElementById("pagination");

    if(!pagination){

        return;

    }

    pagination.innerHTML = "";

    const totalPages =

        Math.ceil(

            CommitteeApp.filteredCommittees.length /

            CommitteeApp.pageSize

        );

    if(totalPages <= 1){

        return;

    }

    for(let i=1;i<=totalPages;i++){

        const button =
            document.createElement("button");

        button.className =

            "btn btn-outline";

        if(i===CommitteeApp.currentPage){

            button.classList.add("btn-primary");

        }

        button.textContent = i;

        button.onclick = ()=>{

            CommitteeApp.currentPage = i;

            renderCommitteeTable();

            renderPagination();

        };

        pagination.appendChild(button);

    }

}
function openCreateModal(){

    CommitteeApp.editingCommitteeId = null;

    document
        .getElementById("modalTitle")
        .textContent =
        "Create Committee";

    document
        .getElementById("committeeForm")
        .reset();

    document
        .getElementById("committeeId")
        .value = "";

    document
        .getElementById("committeeModal")
        .classList.remove("hidden");
        setTimeout(() => {

    document
        .getElementById("committeeName")
        .focus();

},150);

}
function closeCommitteeModal(){

    document
        .getElementById("committeeModal")
        .classList.add("hidden");
        setTimeout(()=>{

document
.getElementById("committeeName")
.focus();

},200);

}
document
    .getElementById("closeCommitteeModal")
    .onclick =
    closeCommitteeModal;

document
    .getElementById("cancelCommittee")
    .onclick =
    closeCommitteeModal;


async function editCommittee(id){

    try{

        const committee =
            await apiRequest(
                "/committees/" + id
            );

        CommitteeApp.editingCommitteeId = id;

        document
            .getElementById("modalTitle")
            .textContent =
            "Edit Committee";

        document
            .getElementById("committeeId")
            .value =
            committee.id;

        document
            .getElementById("committeeName")
            .value =
            committee.name ?? "";

        document
            .getElementById("committeeCategory")
            .value =
            committee.category ?? "";

        document
            .getElementById("committeeDescription")
            .value =
            committee.description ?? "";

        document
            .getElementById("committeeDate")
            .value =
            committee.date ?? "";

        document
            .getElementById("committeeTime")
            .value =
            committee.time ?? "";

        document
            .getElementById("committeeMode")
            .value =
            committee.mode ?? "Online";

        document
            .getElementById("committeeVenue")
            .value =
            committee.venue ?? "";

        document
            .getElementById("committeeMeetingLink")
            .value =
            committee.meetingLink ?? "";

        document
            .getElementById("chairpersonName")
            .value =
            committee.chairpersonName ?? "";

        document
            .getElementById("chairpersonEmail")
            .value =
            committee.chairpersonEmail ?? "";

        document
            .getElementById("committeeModal")
            .classList.remove("hidden");

    }

    catch(error){

        Utils.showToast(
            "Unable to load committee",
            "error"
        );

    }

}
document
    .getElementById("committeeForm")
    .addEventListener(
        "submit",
        saveCommittee
    );

async function saveCommittee(event){

    event.preventDefault();

    const committee = collectCommitteeForm();

    try{

        Utils.showLoader();

        if(CommitteeApp.editingCommitteeId){

            await apiRequest(
                "/committees/" +
                CommitteeApp.editingCommitteeId,
                "PUT",
                committee
            );

            Utils.showToast(
                "Committee updated successfully",
                "success"
            );

        }else{

            await apiRequest(
                "/committees",
                "POST",
                committee
            );

            Utils.showToast(
                "Committee created successfully",
                "success"
            );

        }

        closeCommitteeModal();

        await loadCommittees();

    }

    catch(error){

        Utils.showToast(
            error.message ||
            "Unable to save committee",
            "error"
        );

    }

    finally{

        Utils.hideLoader();

    }

}

function collectCommitteeForm(){

    return{

        name:
            document.getElementById("committeeName").value.trim(),

        category:
            document.getElementById("committeeCategory").value.trim(),

        description:
            document.getElementById("committeeDescription").value.trim(),

        date:
            document.getElementById("committeeDate").value,

        time:
            document.getElementById("committeeTime").value,

        mode:
            document.getElementById("committeeMode").value,

        venue:
            document.getElementById("committeeVenue").value.trim(),

        meetingLink:
            document.getElementById("committeeMeetingLink").value.trim(),

        chairpersonName:
            document.getElementById("chairpersonName").value.trim(),

        chairpersonEmail:
            document.getElementById("chairpersonEmail").value.trim()

    };

}
async function viewCommittee(id){

    try{

        Utils.showLoader();

        const committee =
            await apiRequest(
                "/committees/" + id
            );

        CommitteeApp.selectedCommittee =
            committee;

        renderDrawer(committee);

    }

    catch(error){

        Utils.showToast(
            "Unable to load committee",
            "error"
        );

    }

    finally{

        Utils.hideLoader();

    }

}
function renderDrawer(c){

    document
        .getElementById("drawerContent")
        .innerHTML = `

<h2>${c.name}</h2>

<p class="text-secondary">

${c.category ?? "General"}

</p>

<hr>

<h4>Description</h4>

<p>

${c.description || "No description available."}

</p>

<hr>

<h4>Chairperson</h4>

<p>

${c.chairpersonName ?? "-"}

</p>

<p>

${c.chairpersonEmail ?? "-"}

</p>

<hr>

<h4>Schedule</h4>

<p>

📅 ${Utils.formatDate(c.date)}

</p>

<p>

🕒 ${c.time}

</p>

<hr>

<h4>Venue</h4>

<p>

${c.venue ?? "-"}

</p>

<hr>

<h4>Meeting Link</h4>

<p>

${c.meetingLink || "-"}

</p>

`;

    document
        .getElementById("detailsDrawer")
        .classList.add("open");

    document
        .getElementById("drawerOverlay")
        .classList.add("show");

}
function closeDrawer(){

    document
        .getElementById("detailsDrawer")
        .classList.remove("open");

    document
        .getElementById("drawerOverlay")
        .classList.remove("show");

}
document
    .getElementById("closeDrawer")
    .onclick = closeDrawer;

document
    .getElementById("drawerOverlay")
    .onclick = closeDrawer;

document.addEventListener(
    "keydown",
    e=>{

        if(e.key==="Escape"){

            closeDrawer();

            closeCommitteeModal();

            closeDeleteModal();

        }

    }
);
function exportCommittees(){

    Utils.showToast(

        "Export feature coming soon",

        "info"

    );

}
function deleteCommittee(id){

    const committee = CommitteeApp.committees.find(

        c => c.id === id

    );

    if(!committee){

        Utils.showToast(

            "Committee not found",

            "error"

        );

        return;

    }

    CommitteeApp.deletingCommitteeId = id;

    document.getElementById(

        "deleteCommitteeName"

    ).textContent = committee.name;

    document

        .getElementById("deleteCommitteeModal")

        .classList.remove("hidden");

}
function closeDeleteModal(){

    CommitteeApp.deletingCommitteeId = null;

    document

        .getElementById("deleteCommitteeModal")

        .classList.add("hidden");

}
function safe(value){

    return value ?? "-";

}

async function confirmDeleteCommittee(){

    if(!CommitteeApp.deletingCommitteeId){

        return;

    }

 

        Utils.showLoader();
        const button =

document.getElementById(

"confirmDeleteCommittee"

);
   try{
button.disabled = true;

        await apiRequest(

            "/committees/" +

            CommitteeApp.deletingCommitteeId,

            "DELETE"

        );

        Utils.showToast(

            "Committee deleted successfully",

            "success"

        );

        closeDeleteModal();

        await loadCommittees();

    }

    catch(error){

        Utils.showToast(

            error.message ||

            "Unable to delete committee",

            "error"

        );

    }

    finally{

        Utils.hideLoader();
        button.disabled = false;

    }

}
document

.getElementById("deleteCommitteeModal")

.addEventListener(

"click",

event=>{

    if(

        event.target.id ===

        "deleteCommitteeModal"

    ){

        closeDeleteModal();

    }

});