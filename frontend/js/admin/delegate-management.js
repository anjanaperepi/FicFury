/**
 * ============================================================
 * Admin Delegate Management Controller
 * ============================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    initializeAdminPage
);
function registerAdminEvents(){

    document
        .getElementById("delegateForm")
        ?.addEventListener(
            "submit",
            saveDelegate
        );

    document
        .getElementById("cancelDelegateBtn")
        ?.addEventListener(
            "click",
            closeModal
        );

}

async function initializeAdminPage() {

    try {

        setLoading(true);

        await initializeCommon();
        registerAdminEvents();
        await loadAllDelegates();

    }

    catch (error) {

        handleError(error);

    }

    finally {

        setLoading(false);

    }

}

async function loadAllDelegates() {

    try {

        DelegateApp.delegates =

            await DelegateAPI.getAll();

        DelegateApp.filteredDelegates =

            [...DelegateApp.delegates];

        refreshTable();

    }

    catch (error) {

        handleError(error);

    }

}
async function approveDelegate(id) {

    try {

        setLoading(true);

        await DelegateAPI.adminApprove(id);

        showToast(
            "Registration approved.",
            "success"
        );

        await loadAllDelegates();

    }

    catch(error){

        handleError(error);

    }

    finally{

        setLoading(false);

    }

}
async function rejectDelegate(id){

    const reason = prompt(
        "Enter rejection reason"
    );

    if(!reason)
        return;

    try{

        setLoading(true);

        await DelegateAPI.adminReject(
            id,
            reason
        );

        showToast(
            "Registration rejected.",
            "success"
        );

        await loadAllDelegates();

    }

    catch(error){

        handleError(error);

    }

    finally{

        setLoading(false);

    }

}
function editDelegate(id){

    const delegate =
        DelegateApp.delegates.find(
            d => d.id === id
        );

    if(!delegate)
        return;

    DelegateApp.selectedDelegate = delegate;

    document.getElementById("committee").value =
        delegate.committee?.id ?? "";

    document.getElementById("character").value =
        delegate.character?.id ?? "";

    document.getElementById("status").value =
        delegate.workflowStatus;

    document.getElementById("delegateModal")
        .classList.remove("hidden");

}
async function saveDelegate(event){

    event.preventDefault();

    const delegate =
        DelegateApp.selectedDelegate;

    if(!delegate)
        return;

    const payload = {

        committee: {

            id: Number(
                document.getElementById("committee").value
            )

        },

        character: {

            id: Number(
                document.getElementById("character").value
            )

        },

        workflowStatus:
            document.getElementById("status").value

    };

    try{

        setLoading(true);

        await DelegateAPI.update(
            delegate.id,
            payload
        );

        closeModal();

        await loadAllDelegates();

        showToast(
            "Registration updated.",
            "success"
        );

    }

    catch(error){

        handleError(error);

    }

    finally{

        setLoading(false);

    }

}
async function deleteDelegate(id){

    if(
        !confirm(
            "Delete this registration?"
        )
    ){
        return;
    }

    try{

        setLoading(true);

        await DelegateAPI.remove(id);

        showToast(
            "Registration removed.",
            "success"
        );

        await loadAllDelegates();

    }

    catch(error){

        handleError(error);

    }

    finally{

        setLoading(false);

    }

}
function closeModal(){

    document
        .getElementById("delegateModal")
        ?.classList.add("hidden");

    DelegateApp.selectedDelegate = null;

}
function createActionButtons(delegate){

    return `

        <div class="actions">

            <button
                class="action-btn"
                title="View"
                onclick="viewDelegate(${delegate.id})">
                👁
            </button>

            <button
                class="action-btn"
                title="Edit"
                onclick="editDelegate(${delegate.id})">
                ✏
            </button>

            <button
                class="action-btn success"
                title="Approve"
                onclick="approveDelegate(${delegate.id})">
                ✔
            </button>

            <button
                class="action-btn danger"
                title="Reject"
                onclick="rejectDelegate(${delegate.id})">
                ✖
            </button>

            <button
                class="action-btn danger"
                title="Delete"
                onclick="deleteDelegate(${delegate.id})">
                🗑
            </button>

        </div>

    `;

}