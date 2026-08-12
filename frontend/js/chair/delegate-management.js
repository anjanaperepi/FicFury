/**
 * ============================================================
 * Chair Delegate Management Controller
 * ============================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    initializeChairPage
);

async function initializeChairPage() {

    try {

        setLoading(true);

        await initializeCommon();

        await loadChairDelegates();

    }

    catch (error) {

        handleError(error);

    }

    finally {

        setLoading(false);

    }

}
async function loadChairDelegates() {

    try {

        DelegateApp.delegates =

            await DelegateAPI.getChairDelegates();

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

        await DelegateAPI.chairApprove(id);

        showToast(

            "Delegate approved successfully.",

            "success"

        );

        await loadChairDelegates();

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

        await DelegateAPI.chairReject(

            id,

            reason

        );

        showToast(

            "Delegate rejected.",

            "success"

        );

        await loadChairDelegates();

    }

    catch(error){

        handleError(error);

    }

    finally{

        setLoading(false);

    }

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

            ${
                delegate.workflowStatus === "PENDING_CHAIR"

                ?

                `

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

                `

                :

                ""

            }

        </div>

    `;

}
async function refreshDelegates(){

    await loadChairDelegates();

}