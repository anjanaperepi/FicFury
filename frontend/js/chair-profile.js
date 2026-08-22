/* ==========================================================
   FIC FURY
   CHAIR PROFILE
   ========================================================== */

const ChairProfile = {

    user: null,
    dashboard: null,
    delegates: [],
    selectedCommittee: null,


    /* ======================================================
       INITIALIZATION
    ====================================================== */

    async init() {

        console.log("Initializing Chair Profile...");

        try {

            this.user = this.getCurrentUser();

            if (!this.user) {

                console.warn(
                    "No authenticated user found."
                );

                window.location.href = "login.html";

                return;
            }


            await this.loadProfile();

            console.log(
                "Chair Profile initialized successfully."
            );

        } catch (error) {

            console.error(
                "Chair Profile initialization failed:",
                error
            );

            this.showPageError();

        }

    },


    /* ======================================================
       CURRENT USER
    ====================================================== */

    getCurrentUser() {

        if (
            typeof Auth !== "undefined" &&
            typeof Auth.getCurrentUser === "function"
        ) {

            const user =
                Auth.getCurrentUser();

            if (user) {

                return user;

            }

        }


        const storedUser =
            localStorage.getItem(
                CONFIG.USER_KEY
            );

        if (storedUser) {

            try {

                return JSON.parse(
                    storedUser
                );

            } catch (error) {

                console.error(
                    "Unable to parse stored user:",
                    error
                );

            }

        }


        return null;

    },


    /* ======================================================
       LOAD CHAIR PROFILE
    ====================================================== */

    async loadProfile() {

        this.dashboard =
            await apiRequest(
                "/dashboard/chair"
            );


        console.log(
            "Chair dashboard:",
            this.dashboard
        );


       

        this.renderProfile();

    },



    /* ======================================================
       RENDER EVERYTHING
    ====================================================== */

    renderProfile() {

        this.renderUser();

        this.renderIdentity();

        this.renderCommittee();

        this.renderStatistics();

        this.renderDelegates();

    },


    /* ======================================================
       USER
    ====================================================== */

    renderUser() {

        const name =
            this.dashboard?.chairName ||
            this.user?.fullName ||
            this.user?.name ||
            "Chair";


        this.setText(
            "profileName",
            name
        );

    },


    /* ======================================================
       ROLE / IDENTITY
    ====================================================== */
renderIdentity() {

    this.setText(
        "profileRole",
        "Chair"
    );


    const committees =
        Array.isArray(
            this.dashboard?.committees
        )
            ? this.dashboard.committees
            : [];


    if (committees.length === 0) {

        this.setText(
            "committeeName",
            "No committees assigned"
        );

        return;
    }


    if (committees.length === 1) {

        const committee =
            committees[0];

        this.setText(
            "committeeName",
            committee.name ||
            committee.committeeName ||
            "Unnamed Committee"
        );

        return;
    }


    this.setText(
        "committeeName",
        `${committees.length} Committees`
    );

},




renderCommittee() {

    const committees =
        Array.isArray(
            this.dashboard?.committees
        )
            ? this.dashboard.committees
            : [];


    const container =
        document.getElementById(
            "committeeBody"
        );


    if (!container) {
        return;
    }


    if (committees.length === 0) {

        container.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="profile-empty-state"
                >

                    <i class="fa-solid fa-landmark"></i>

                    <strong>
                        No committees assigned
                    </strong>

                    <p>
                        You are not currently
                        assigned as a Chair.
                    </p>

                </td>

            </tr>
        `;

        return;

    }


    container.innerHTML =
        committees
            .map(
                committee =>
                    this.createCommitteeRow(
                        committee
                    )
            )
            .join("");

},
createCommitteeRow(committee) {

    return `
        <tr>

            <td>
                ${this.escapeHtml(
                    committee.name ||
                    committee.committeeName ||
                    "—"
                )}
            </td>


            <td>
                ${this.escapeHtml(
                    committee.category ||
                    "—"
                )}
            </td>


            <td>

                <span class="registration-status active">
                    CHAIR
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="profile-action-btn committee-manage-btn"
                    data-committee-id="${committee.id}"
                >

                    <i class="fa-solid fa-gear"></i>

                    MANAGE

                </button>

            </td>

        </tr>
    `;

},
selectCommittee(committeeId) {

    const committees =
        Array.isArray(
            this.dashboard?.committees
        )
            ? this.dashboard.committees
            : [];


    const committee =
        committees.find(
            item =>
                Number(item.id) ===
                Number(committeeId)
        );


    if (!committee) {

        FuryToast.error(
            "Committee could not be found."
        );

        return;

    }


    this.selectedCommittee =
        committee;


    console.log(
        "Selected committee:",
        committee
    );


    this.openCommitteeActionModal();

},
setupCommitteeActions() {

    const committeeBody =
        document.getElementById(
            "committeeBody"
        );


    if (!committeeBody) {
        return;
    }


    committeeBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".committee-manage-btn"
                );


            if (!button) {
                return;
            }


            const committeeId =
                button.dataset.committeeId;


            this.selectCommittee(
                committeeId
            );

        }
    );

},

    /* ======================================================
       STATISTICS
    ====================================================== */

  renderStatistics() {

    this.setText(
        "committeeCount",
        this.dashboard?.committees?.length ?? 0
    );


    this.setText(
        "delegateCount",
        this.dashboard?.delegateCount ?? 0
    );

},



async loadCommitteeDelegates(committeeId) {

    try {

        const committee =
            this.dashboard?.committees?.find(
                item =>
                    Number(item.id) ===
                    Number(committeeId)
            );

        if (!committee) {

            FuryToast.error(
                "Committee could not be found."
            );

            return;
        }


        this.delegates =
            await apiRequest(
                `/dashboard/chair/committee/${committeeId}/delegates`
            );


        // Update the committee name above
        // the delegates table
        const committeeName =
            committee.name ||
            committee.committeeName ||
            "Selected Committee";


        this.setText(
            "delegatesCommitteeLabel",
            `Delegates assigned to ${committeeName}.`
        );


        // Render the delegates
        this.renderDelegates();


        console.log(
            "Delegates loaded for:",
            committeeName,
            this.delegates
        );


    } catch (error) {

        console.error(
            "Unable to load committee delegates:",
            error
        );

        this.delegates = [];

        this.renderDelegates();

        FuryToast.error(
            "Unable to load delegates."
        );

    }

},
    /* ======================================================
       DELEGATES
    ====================================================== */

    renderDelegates() {

        const tbody =
            document.getElementById(
                "delegatesBody"
            );


        if (!tbody) {

            return;

        }


        if (
            !Array.isArray(
                this.delegates
            ) ||
            this.delegates.length === 0
        ) {

            tbody.innerHTML = `
                <tr>

                    <td
                        colspan="3"
                        class="profile-empty-state"
                    >

                        <i class="fa-solid fa-users"></i>

                        <strong>
                            No delegates yet
                        </strong>

                        <p>
                            No delegates are currently
                            assigned to your committee.
                        </p>

                    </td>

                </tr>
            `;

            return;

        }


        tbody.innerHTML =
            this.delegates
                .map(
                    delegate =>
                        this.createDelegateRow(
                            delegate
                        )
                )
                .join("");

    },


    /* ======================================================
       DELEGATE ROW
    ====================================================== */

    createDelegateRow(delegate) {

        const name =
            delegate.delegateName ||
            "Unknown Delegate";


        const email =
            delegate.email ||
            "—";


        const character =
            delegate.characterName ||
            "—";


        return `

            <tr>

                <td>
                    ${this.escapeHtml(name)}
                </td>

                <td>
                    ${this.escapeHtml(email)}
                </td>

                <td>
                    ${this.escapeHtml(character)}
                </td>

            </tr>

        `;

    },


    /* ======================================================
       HELPERS
    ====================================================== */

    formatPercentage(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "0%";

        }


        return `${Number(value).toFixed(0)}%`;

    },


    setText(id, value) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value ?? "—";

        }

    },


    escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    },


    showPageError() {

        if (
            typeof FuryToast !== "undefined"
        ) {

            FuryToast.error(
                "Unable to load your Chair Profile."
            );

        }

    },

    /* ======================================================
   COMMITTEE CHANGE MODAL
====================================================== */

openCommitteeChangeModal() {

    const committee =
        this.selectedCommittee;


    if (!committee) {

        FuryToast.error(
            "Please select a committee first."
        );

        return;

    }


    // Existing form population
    // now uses `committee`

    document.getElementById(
        "changeCommitteeId"
    ).value =
        committee.id;


    document.getElementById(
        "changeCommitteeDisplay"
    ).value =
        committee.name ||
        committee.committeeName ||
        "";


    document.getElementById(
        "changeCommitteeName"
    ).value =
        committee.name ||
        committee.committeeName ||
        "";


    document.getElementById(
        "changeCommitteeCategory"
    ).value =
        committee.category ||
        "";


    document.getElementById(
        "changeCommitteeDescription"
    ).value =
        committee.description ||
        "";


    document.getElementById(
        "changeCommitteeDate"
    ).value =
        committee.date ||
        "";


    document.getElementById(
        "changeCommitteeTime"
    ).value =
        committee.time ||
        "";


    document.getElementById(
        "changeCommitteeMode"
    ).value =
        committee.mode ||
        "";


    document.getElementById(
        "changeCommitteeVenue"
    ).value =
        committee.venue ||
        "";


    document.getElementById(
        "changeCommitteeMeetingLink"
    ).value =
        committee.meetingLink ||
        "";


    document.getElementById(
        "committeeChangeReason"
    ).value =
        "";


    const modal =
        document.getElementById(
            "committeeChangeModal"
        );


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

},


closeCommitteeChangeModal() {

    const modal =
        document.getElementById(
            "committeeChangeModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    const form =
        document.getElementById(
            "committeeChangeForm"
        );


    if (form) {

        form.reset();

    }

},
async submitCommitteeChange() {

    const committeeId =
        document.getElementById(
            "changeCommitteeId"
        ).value;


    const payload = {

        committeeId:
            Number(committeeId),

        committeeName:
            document.getElementById(
                "changeCommitteeName"
            ).value.trim(),

        category:
            document.getElementById(
                "changeCommitteeCategory"
            ).value.trim(),

        description:
            document.getElementById(
                "changeCommitteeDescription"
            ).value.trim(),

        date:
            document.getElementById(
                "changeCommitteeDate"
            ).value,

        time:
            document.getElementById(
                "changeCommitteeTime"
            ).value,

        mode:
            document.getElementById(
                "changeCommitteeMode"
            ).value,

        venue:
            document.getElementById(
                "changeCommitteeVenue"
            ).value.trim(),

        meetingLink:
            document.getElementById(
                "changeCommitteeMeetingLink"
            ).value.trim(),

        changeReason:
            document.getElementById(
                "committeeChangeReason"
            ).value.trim()

    };


    try {

        const submitButton =
            document.getElementById(
                "submitCommitteeChange"
            );


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i>
                 SUBMITTING...`;

        }


        await apiRequest(
            "/committee-change-requests",
            "POST",
            payload
        );


        this.closeCommitteeChangeModal();


        FuryToast.success(
            "Committee change request submitted."
        );


} catch (error) {

    console.error(
        "Committee change request failed:",
        error
    );


    const errorMessage =
        error?.message || "";


    if (
        errorMessage
            .toLowerCase()
            .includes("pending")
    ) {

        FuryToast.warning(
            "A committee change request is already pending for this committee."
        );

    } else {

        FuryToast.error(
            "Unable to submit committee change request."
        );

    }

}finally {

        const submitButton =
            document.getElementById(
                "submitCommitteeChange"
            );


        if (submitButton) {

            submitButton.disabled = false;

            submitButton.innerHTML =
                `<i class="fa-solid fa-paper-plane"></i>
                 SUBMIT REQUEST`;

        }

    }

},

async submitLeaveCommittee() {

    const committee =
        this.selectedCommittee;


    if (!committee) {

        FuryToast.error(
            "No committee selected."
        );

        return;
    }


    const confirmButton =
        document.getElementById(
            "confirmLeaveCommittee"
        );


    try {

        if (confirmButton) {

            confirmButton.disabled = true;

            confirmButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                PROCESSING...
            `;

        }


const response =
    await apiRequest(
        `/dashboard/chair/committee/${committee.id}/leave`,
        "POST"
    );


        console.log(
            "Leave committee response:",
            response
        );


        this.closeLeaveCommitteeModal();


        FuryToast.success(
            response ||
            "You have left the committee successfully."
        );


        /*
         * Remove the committee from the local
         * dashboard state.
         */

        if (
            Array.isArray(
                this.dashboard?.committees
            )
        ) {

            this.dashboard.committees =
                this.dashboard.committees.filter(
                    item =>
                        Number(item.id) !==
                        Number(committee.id)
                );

        }


        this.selectedCommittee = null;


        /*
         * If there are no committees left,
         * the backend changed the role to DELEGATE.
         * Reload so the application can redirect/
         * initialize the correct dashboard.
         */

        if (
            !this.dashboard?.committees ||
            this.dashboard.committees.length === 0
        ) {

            window.location.reload();

            return;

        }


        /*
         * Otherwise the Chair still has committees.
         */

        this.renderCommittee();

        this.renderStatistics();


    } catch (error) {

        console.error(
            "Leave committee failed:",
            error
        );


        const message =
            error?.message || "";


        if (
            message
                .toLowerCase()
                .includes("not assigned")
        ) {

            FuryToast.error(
                "You are no longer assigned to this committee."
            );

        } else {

            FuryToast.error(
                "Unable to leave the committee."
            );

        }


    } finally {

        if (confirmButton) {

            confirmButton.disabled = false;

            confirmButton.innerHTML = `
                <i class="fa-solid fa-right-from-bracket"></i>
                LEAVE COMMITTEE
            `;

        }

    }

},
openCommitteeActionModal() {

    const committee =
        this.selectedCommittee;


    if (!committee) {

        FuryToast.error(
            "Please select a committee first."
        );

        return;

    }


    const modal =
        document.getElementById(
            "committeeActionModal"
        );


    if (!modal) {
        return;
    }


    const name =
        committee.name ||
        committee.committeeName ||
        "Committee";


    this.setText(
        "committeeActionTitle",
        name
    );


    this.setText(
        "committeeActionDescription",
        "Choose an action for this committee."
    );


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

},


closeCommitteeActionModal() {

    const modal =
        document.getElementById(
            "committeeActionModal"
        );

    if (!modal) {
        return;
    }


    /*
     * Move focus away from the modal before
     * hiding it from assistive technology.
     */

    if (
        document.activeElement &&
        modal.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

},
openLeaveCommitteeModal() {

    const committee =
        this.selectedCommittee;

    if (!committee) {
        return;
    }


    const modal =
        document.getElementById(
            "leaveCommitteeModal"
        );

    if (!modal) {
        return;
    }


    const committeeName =
        committee.name ||
        committee.committeeName ||
        "Selected Committee";


    this.setText(
        "leaveCommitteeName",
        committeeName
    );


    this.setText(
        "leaveCommitteeDescription",
        `Please confirm that you want to leave ${committeeName}.`
    );


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    const closeButton =
        document.getElementById(
            "closeLeaveCommitteeModal"
        );


    if (closeButton) {

        requestAnimationFrame(() => {
            closeButton.focus();
        });

    }

},
closeLeaveCommitteeModal() {

    const modal =
        document.getElementById(
            "leaveCommitteeModal"
        );

    if (!modal) {
        return;
    }


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

},
openProposeCommitteeModal() {

    const modal =
        document.getElementById(
            "proposeCommitteeModal"
        );


    if (!modal) {

        console.error(
            "Propose Committee modal not found."
        );

        return;
    }


    const form =
        document.getElementById(
            "proposeCommitteeForm"
        );


    if (form) {
        form.reset();
    }


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    requestAnimationFrame(() => {

        const input =
            document.getElementById(
                "proposalCommitteeName"
            );

        if (input) {
            input.focus();
        }

    });

},


closeProposeCommitteeModal() {

    const modal =
        document.getElementById(
            "proposeCommitteeModal"
        );


    if (!modal) {
        return;
    }


    if (
        document.activeElement &&
        modal.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

},
async submitChairCommitteeProposal() {

    const form =
        document.getElementById(
            "proposeCommitteeForm"
        );

    if (!form) {
        return;
    }


    const payload = {

        committeeName:
            document.getElementById(
                "proposalCommitteeName"
            ).value.trim(),

        category:
            document.getElementById(
                "proposalCategory"
            ).value.trim(),

        description:
            document.getElementById(
                "proposalDescription"
            ).value.trim(),

        date:
            document.getElementById(
                "proposalDate"
            ).value,

        time:
            document.getElementById(
                "proposalTime"
            ).value,

        mode:
            document.getElementById(
                "proposalMode"
            ).value,

        venue:
            document.getElementById(
                "proposalVenue"
            ).value.trim(),

        meetingLink:
            document.getElementById(
                "proposalMeetingLink"
            ).value.trim(),

        proposalReason:
            document.getElementById(
                "proposalReason"
            ).value.trim()

    };


    const submitButton =
        document.getElementById(
            "submitProposeCommittee"
        );


    try {

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                SUBMITTING...
            `;

        }


        await apiRequest(
            "/chair-committee-proposals",
            "POST",
            payload
        );


        this.closeProposeCommitteeModal();


        FuryToast.success(
            "Committee proposal submitted successfully."
        );


    } catch (error) {

        console.error(
            "Chair committee proposal submission failed:",
            error
        );


        FuryToast.error(
            error?.message ||
            "Unable to submit committee proposal."
        );


    } finally {

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.innerHTML = `
                <i class="fa-solid fa-paper-plane"></i>
                SUBMIT PROPOSAL
            `;

        }

    }

},

if (cancelProposeCommittee) {

    cancelProposeCommittee.addEventListener(
        "click",
        () => {

            ChairProfile
                .closeProposeCommitteeModal();

        }
    );

}

};
document.addEventListener(
    "DOMContentLoaded",
    () => {

        ChairProfile.init();

        ChairProfile.setupCommitteeActions();



     const closeCommitteeActionModal =
    document.getElementById(
        "closeCommitteeActionModal"
    );


const openCommitteeChangeFromAction =
    document.getElementById(
        "openCommitteeChangeFromAction"
    );


if (openCommitteeChangeFromAction) {

    openCommitteeChangeFromAction.addEventListener(
        "click",
        () => {

            ChairProfile
                .closeCommitteeActionModal();

            ChairProfile
                .openCommitteeChangeModal();

        }
    );

}

const viewCommitteeDelegates =
    document.getElementById(
        "viewCommitteeDelegates"
    );


if (viewCommitteeDelegates) {

    viewCommitteeDelegates.addEventListener(
        "click",
        async () => {

            const committee =
                ChairProfile.selectedCommittee;


            if (!committee) {

                FuryToast.error(
                    "Please select a committee first."
                );

                return;
            }


            ChairProfile
                .closeCommitteeActionModal();


            await ChairProfile
                .loadCommitteeDelegates(
                    committee.id
                );


            const delegatesSection =
                document.getElementById(
                    "delegatesSection"
                );


            if (delegatesSection) {

                delegatesSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


if (closeCommitteeActionModal) {

    closeCommitteeActionModal.addEventListener(
        "click",
        () =>
            ChairProfile
                .closeCommitteeActionModal()
    );

}




        const openButton =
            document.getElementById(
                "requestCommitteeChangeBtn"
            );


        const closeButton =
            document.getElementById(
                "closeCommitteeChangeModal"
            );


        const cancelButton =
            document.getElementById(
                "cancelCommitteeChange"
            );


        const form =
            document.getElementById(
                "committeeChangeForm"
            );


        if (openButton) {

            openButton.addEventListener(
                "click",
                () =>
                    ChairProfile
                        .openCommitteeChangeModal()
            );

        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () =>
                    ChairProfile
                        .closeCommitteeChangeModal()
            );

        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                () =>
                    ChairProfile
                        .closeCommitteeChangeModal()
            );

        }


        if (form) {

            form.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    if (
                        !form.checkValidity()
                    ) {

                        form.reportValidity();

                        return;

                    }


                    ChairProfile
                        .submitCommitteeChange();

                }
            );

        }


        const leaveCommitteeFromAction =
    document.getElementById(
        "leaveCommitteeFromAction"
    );


if (leaveCommitteeFromAction) {

    leaveCommitteeFromAction.addEventListener(
        "click",
        () => {

            const committee =
                ChairProfile.selectedCommittee;


            if (!committee) {

                FuryToast.error(
                    "Please select a committee first."
                );

                return;
            }


            ChairProfile
                .closeCommitteeActionModal();


            ChairProfile
                .openLeaveCommitteeModal();

        }
    );

}

const closeLeaveCommitteeModal =
    document.getElementById(
        "closeLeaveCommitteeModal"
    );


const cancelLeaveCommittee =
    document.getElementById(
        "cancelLeaveCommittee"
    );


const confirmLeaveCommittee =
    document.getElementById(
        "confirmLeaveCommittee"
    );


if (closeLeaveCommitteeModal) {

    closeLeaveCommitteeModal.addEventListener(
        "click",
        () =>
            ChairProfile
                .closeLeaveCommitteeModal()
    );

}


if (cancelLeaveCommittee) {

    cancelLeaveCommittee.addEventListener(
        "click",
        () =>
            ChairProfile
                .closeLeaveCommitteeModal()
    );

}


if (confirmLeaveCommittee) {

    confirmLeaveCommittee.addEventListener(
        "click",
        () =>
            ChairProfile
                .submitLeaveCommittee()
    );

}

const proposeAnotherCommitteeBtn =
    document.getElementById(
        "proposeAnotherCommitteeBtn"
    );


if (proposeAnotherCommitteeBtn) {

    proposeAnotherCommitteeBtn.addEventListener(
        "click",
        () => {

            ChairProfile
                .openProposeCommitteeModal();

        }
    );

}

const closeProposeCommitteeModal =
    document.getElementById(
        "closeProposeCommitteeModal"
    );


const cancelProposeCommittee =
    document.getElementById(
        "cancelProposeCommittee"
    );


if (closeProposeCommitteeModal) {

    closeProposeCommitteeModal.addEventListener(
        "click",
        () => {

            ChairProfile
                .closeProposeCommitteeModal();

        }
    );

}


if (cancelProposeCommittee) {

    cancelProposeCommittee.addEventListener(
        "click",
        () => {

            ChairProfile
                .closeProposeCommitteeModal();

        }
    );

}
const proposeCommitteeForm =
    document.getElementById(
        "proposeCommitteeForm"
    );


if (proposeCommitteeForm) {

    proposeCommitteeForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (
                !proposeCommitteeForm.checkValidity()
            ) {

                proposeCommitteeForm.reportValidity();

                return;

            }


            ChairProfile
                .submitChairCommitteeProposal();

        }
    );

}
        

    }
);

