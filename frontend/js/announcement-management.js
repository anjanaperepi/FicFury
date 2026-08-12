/* =========================================================
   FIC FURY
   Announcement Management
   ========================================================= */

const AnnouncementManager = {

    announcements: [],
    committees: [],
    currentAnnouncementId: null,
    deleteAnnouncementId: null,
    currentUser: null,

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    async init() {

        console.log("📢 Announcement Manager initializing...");

        try {

            this.currentUser = this.getCurrentUser();

            console.log(
                "👤 Announcement Manager user:",
                this.currentUser
            );

            this.registerEvents();

            

            await this.loadCommittees();
            await this.loadAnnouncements();

            this.updateStats();

            console.log(
                "✅ Announcement Manager initialized successfully"
            );

        } catch (error) {

            console.error(
                "❌ Announcement Manager initialization failed:",
                error
            );

            this.showError(
                "Failed to initialize announcement management."
            );
        }
    },


    /* =====================================================
       USER / ROLE
       ===================================================== */

    getCurrentUser() {

        const possibleKeys = [
            "ficfury_user",
            "ficfuryUser",
            "user",
            "currentUser"
        ];
    for (const key of possibleKeys) {

        const value =
            localStorage.getItem(key);

        if (!value) {
            continue;
        }

        try {

            const user =
                JSON.parse(value);

            /*
             * committeeId is stored separately
             * during login.
             */
            const storedCommitteeId =
                localStorage.getItem("committeeId");

            if (
                storedCommitteeId &&
                !user.committeeId
            ) {
                user.committeeId =
                    Number(storedCommitteeId);
            }

            /*
             * Email is stored inside the JWT.
             */
            const token =
                localStorage.getItem(
                    "ficfury_token"
                );

            if (
                token &&
                !user.email
            ) {

                const payload =
                    JSON.parse(
                        atob(
                            token.split(".")[1]
                        )
                    );

                if (payload.sub) {
                    user.email =
                        payload.sub;
                }
            }

            return user;

        } catch (error) {

            console.error(
                "Could not parse stored user:",
                error
            );
        }
    }

    return {
        role:
            localStorage.getItem(
                "ficfury_role"
            ) ||
            localStorage.getItem(
                "role"
            ) ||
            "ADMIN"
    };
},


    getRole() {

        if (!this.currentUser) {
            return "ADMIN";
        }

        return String(
            this.currentUser.role ||
            this.currentUser.userRole ||
            this.currentUser.authority ||
            "ADMIN"
        ).toUpperCase();
    },


    /* =====================================================
       EVENT REGISTRATION
       ===================================================== */

    registerEvents() {

        /* New announcement */

        const addButton =
            document.getElementById(
                "addAnnouncementBtn"
            );

        if (addButton) {

            addButton.addEventListener(
                "click",
                () => this.openCreateModal()
            );
        }


        /* Refresh */

        const refreshButton =
            document.getElementById(
                "refreshAnnouncements"
            );

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                () => this.refresh()
            );
        }


        /* Search */

        const search =
            document.getElementById(
                "announcementSearch"
            );

        if (search) {

            search.addEventListener(
                "input",
                () => this.renderAnnouncements()
            );
        }


        /* Status filter */

        const statusFilter =
            document.getElementById(
                "statusFilter"
            );

        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                () => this.renderAnnouncements()
            );
        }


        /* Committee filter */

        const committeeFilter =
            document.getElementById(
                "committeeFilter"
            );

        if (committeeFilter) {

            committeeFilter.addEventListener(
                "change",
                () => this.renderAnnouncements()
            );
        }


        /* Form */

        const form =
            document.getElementById(
                "announcementForm"
            );

        if (form) {

            form.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    this.saveAnnouncement();
                }
            );
        }


        /* Close announcement modal */

        const closeButton =
            document.getElementById(
                "closeAnnouncementModal"
            );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => this.closeModal()
            );
        }


        /* Cancel announcement */

        const cancelButton =
            document.getElementById(
                "cancelAnnouncementBtn"
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                () => this.closeModal()
            );
        }


        /* Empty-state create button */

        const emptyCreateButton =
            document.getElementById(
                "emptyCreateBtn"
            );

        if (emptyCreateButton) {

            emptyCreateButton.addEventListener(
                "click",
                () => this.openCreateModal()
            );
        }


        /* Delete modal */

        const cancelDelete =
            document.getElementById(
                "cancelDeleteAnnouncement"
            );

        if (cancelDelete) {

            cancelDelete.addEventListener(
                "click",
                () => this.closeDeleteModal()
            );
        }


        const confirmDelete =
            document.getElementById(
                "confirmDeleteAnnouncement"
            );

        if (confirmDelete) {

            confirmDelete.addEventListener(
                "click",
                () => this.confirmDelete()
            );
        }


        /* Close modals by clicking background */

        const announcementModal =
            document.getElementById(
                "announcementModal"
            );

        if (announcementModal) {

            announcementModal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        announcementModal
                    ) {

                        this.closeModal();
                    }
                }
            );
        }


        const deleteModal =
            document.getElementById(
                "deleteAnnouncementModal"
            );

        if (deleteModal) {

            deleteModal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        deleteModal
                    ) {

                        this.closeDeleteModal();
                    }
                }
            );
        }


        /* Escape key */

        document.addEventListener(
            "keydown",
            event => {

                if (event.key !== "Escape") {
                    return;
                }

                this.closeModal();
                this.closeDeleteModal();
            }
        );
    },


    /* =====================================================
       LOAD ANNOUNCEMENTS
       ===================================================== */

    async loadAnnouncements() {

        this.showLoading();

        try {

            const role =
                this.getRole();

            let response;

            /*
             * ADMIN
             * GET /api/announcements
             */

if (role === "ADMIN") {

    response = await apiRequest(
        "/announcements",
        "GET"
    );
}

            /*
             * CHAIR
             *
             * The backend does NOT permit a CHAIR
             * to call GET /api/announcements.
             *
             * We therefore need the chair's committee.
             */

else if (role === "CHAIR") {

    const committees =
        await this.getChairCommittees();

    if (
        !committees ||
        committees.length === 0
    ) {

        this.announcements = [];

        this.renderAnnouncements();

        this.showError(
            "No committees are assigned to this chair."
        );

        return;
    }


    /*
     * Load announcements for EVERY committee
     * this Chair is assigned to.
     */

    const responses =
        await Promise.all(
            committees.map(
                committee =>
                    apiRequest(
                        `/announcements/committee/${committee.id}`,
                        "GET"
                    )
            )
        );


    /*
     * Each endpoint may return:
     *
     * [ ... ]
     *
     * or a wrapped response.
     */

    this.announcements =
        responses.flatMap(
            response =>
                this.normalizeList(response)
        );

    this.renderAnnouncements();

    this.updateStats();

    return;
}

            else {

                throw new Error(
                    "You are not authorized to manage announcements."
                );
            }


            this.announcements =
                this.normalizeList(response);


            console.log(
                "📢 Announcements loaded:",
                this.announcements
            );


            this.renderAnnouncements();

            this.updateStats();

        } catch (error) {

            console.error(
                "❌ Failed to load announcements:",
                error
            );

            this.announcements = [];

            this.renderAnnouncements();

            this.showError(
                this.getErrorMessage(
                    error,
                    "Failed to load announcements."
                )
            );

        } finally {

            this.hideLoading();
        }
    },


    /* =====================================================
       LOAD COMMITTEES
       ===================================================== */

    async loadCommittees() {

        try {

const response =
    await apiRequest(
        "/committees",
        "GET"
    );

            this.committees =
                this.normalizeList(response);


            console.log(
                "🏛️ Committees loaded:",
                this.committees
            );


            this.populateCommitteeFilter();

            await this.prepareCommitteeField();

        } catch (error) {

            console.error(
                "❌ Failed to load committees:",
                error
            );
        }
    },

async getChairCommittee() {

    const user =
        this.currentUser || {};

    console.log(
        "🔎 Finding chair's committee..."
    );

    console.log(
        "👤 Chair:",
        user
    );

    console.log(
        "🏛️ Stored committee ID:",
        user.committeeId
    );


    /*
     * =====================================================
     * CHAIR COMMITTEE
     * =====================================================
     *
     * The login system already stores the committee ID.
     * Use it to identify the committee for the UI.
     */

    if (user.committeeId) {

        const committee =
            this.committees.find(
                item =>
                    String(item.id) ===
                    String(user.committeeId)
            );

        if (committee) {

            console.log(
                "✅ Chair committee found:",
                committee
            );

            return committee;
        }

        console.warn(
            "⚠️ Committee ID exists but was not found " +
            "in the loaded committee list:",
            user.committeeId
        );
    }


    /*
     * =====================================================
     * FALLBACK: EMAIL MATCH
     * =====================================================
     */

    if (user.email) {

        const committee =
            this.committees.find(
                item => {

                    const chairEmail =
                        item.chairpersonEmail;

                    if (!chairEmail) {
                        return false;
                    }

                    return (
                        chairEmail
                            .toLowerCase()
                            .trim() ===
                        user.email
                            .toLowerCase()
                            .trim()
                    );
                }
            );

        if (committee) {

            console.log(
                "✅ Chair committee found by email:",
                committee
            );

            return committee;
        }
    }


    console.error(
        "❌ Could not determine chair committee."
    );

    return null;
},

    /* =====================================================
       COMMITTEE FILTER
       ===================================================== */

    populateCommitteeFilter() {

        const filter =
            document.getElementById(
                "committeeFilter"
            );

        if (!filter) {
            return;
        }

        filter.innerHTML =
            `<option value="ALL">
                All Committees
            </option>`;


        this.committees.forEach(
            committee => {

                if (!committee?.id) {
                    return;
                }

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    committee.id;

                option.textContent =
                    committee.name ||
                    `Committee ${committee.id}`;

                filter.appendChild(option);
            }
        );
    },



async prepareCommitteeField() {

    const select =
        document.getElementById(
            "announcementCommittee"
        );

    if (!select) {
        return;
    }

    const role =
        this.getRole();


    /*
     * =====================================================
     * RESET
     * =====================================================
     */

    select.innerHTML = "";


    /*
     * =====================================================
     * ADMIN
     * =====================================================
     *
     * Admin can create:
     *
     * 1. Global announcements
     * 2. Committee-specific announcements
     */

    if (role === "ADMIN") {

        const globalOption =
            document.createElement("option");

        globalOption.value = "";

        globalOption.textContent =
            "🌐 Global — All FIC FURY";

        select.appendChild(
            globalOption
        );


        this.committees.forEach(
            committee => {

                if (!committee?.id) {
                    return;
                }

                const option =
                    document.createElement("option");

                option.value =
                    committee.id;

                option.textContent =
                    `🏛️ ${
                        committee.name ||
                        `Committee ${committee.id}`
                    }`;

                select.appendChild(
                    option
                );
            }
        );


        select.disabled = false;

        return;
    }


if (role === "CHAIR") {

    const committees =
        await this.getChairCommittees();

    if (
        !committees ||
        committees.length === 0
    ) {

        const option =
            document.createElement("option");

        option.value = "";

        option.textContent =
            "No committees assigned";

        select.appendChild(option);

        select.disabled = true;

        return;
    }


    committees.forEach(
        committee => {

            if (!committee?.id) {
                return;
            }

            const option =
                document.createElement("option");

            option.value =
                String(committee.id);

            option.textContent =
                `🏛️ ${
                    committee.name ||
                    committee.committeeName ||
                    `Committee ${committee.id}`
                }`;

            select.appendChild(option);
        }
    );


    /*
     * The Chair can select one of
     * their assigned committees.
     */
    select.disabled = false;

    return;
}

    /*
     * =====================================================
     * UNKNOWN ROLE
     * =====================================================
     */

    select.disabled = true;
},
configureAudienceField() {

    const select =
        document.getElementById(
            "announcementAudience"
        );

    if (!select) {
        return;
    }

    const role =
        this.getRole();

    select.innerHTML = "";


    /*
     * =====================================================
     * ADMIN
     * =====================================================
     */

    if (role === "ADMIN") {

        this.addAudienceOption(
            select,
            "CHAIRS_ONLY",
            "👨‍⚖️ Chairs Only"
        );

        this.addAudienceOption(
            select,
            "DELEGATES_ONLY",
            "👥 Delegates Only"
        );

        this.addAudienceOption(
            select,
            "CHAIRS_AND_DELEGATES",
            "👨‍⚖️👥 Chairs & Delegates"
        );

        select.disabled = false;

        select.value =
            "CHAIRS_AND_DELEGATES";

        return;
    }


    /*
     * =====================================================
     * CHAIR
     * =====================================================
     */

if (role === "CHAIR") {

    this.addAudienceOption(
        select,
        "DELEGATES_ONLY",
        "👥 Delegates Only"
    );

    this.addAudienceOption(
        select,
        "CHAIRS_AND_DELEGATES",
        "👨‍⚖️👥 Chairs & Delegates"
    );

    select.disabled = false;

    return;
}


    /*
     * =====================================================
     * UNKNOWN ROLE
     * =====================================================
     */

    select.disabled = true;
},


addAudienceOption(
    select,
    value,
    label
) {

    const option =
        document.createElement("option");

    option.value = value;
    option.textContent = label;

    select.appendChild(option);
},
    /* =====================================================
       FILTERING
       ===================================================== */

    getFilteredAnnouncements() {

        const search =
            (
                document.getElementById(
                    "announcementSearch"
                )?.value || ""
            )
            .trim()
            .toLowerCase();


        const status =
            document.getElementById(
                "statusFilter"
            )?.value || "ALL";


        const committee =
            document.getElementById(
                "committeeFilter"
            )?.value || "ALL";


        return this.announcements.filter(
            announcement => {

                const title =
                    String(
                        announcement.title || ""
                    ).toLowerCase();


                const content =
                    String(
                        announcement.content || ""
                    ).toLowerCase();


                const committeeName =
                    String(
                        announcement.committeeName || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    title.includes(search) ||
                    content.includes(search) ||
                    committeeName.includes(search);


                const announcementStatus =
                    String(
                        announcement.status ||
                        "DRAFT"
                    ).toUpperCase();


                const matchesStatus =
                    status === "ALL" ||
                    announcementStatus ===
                    status;


                const announcementCommittee =
                    String(
                        announcement.committeeId ||
                        ""
                    );


                const matchesCommittee =
                    committee === "ALL" ||
                    announcementCommittee ===
                    String(committee);


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesCommittee
                );
            }
        );
    },


    /* =====================================================
       RENDER
       ===================================================== */

    renderAnnouncements() {

        const container =
            document.getElementById(
                "announcementList"
            );

        const emptyState =
            document.getElementById(
                "announcementEmptyState"
            );


        if (!container) {

            console.error(
                "❌ #announcementList not found."
            );

            return;
        }


        const filtered =
            this.getFilteredAnnouncements();


        container.innerHTML = "";


        if (filtered.length === 0) {

            if (emptyState) {
                emptyState.classList.remove(
                    "hidden"
                );
            }

            return;
        }


        if (emptyState) {

            emptyState.classList.add(
                "hidden"
            );
        }


        filtered.forEach(
            announcement => {

                container.insertAdjacentHTML(
                    "beforeend",
                    this.createAnnouncementCard(
                        announcement
                    )
                );
            }
        );
    },

async getChairCommittees() {

    const role =
        this.getRole();

    if (role !== "CHAIR") {
        return [];
    }


    try {

        const response =
            await apiRequest(
                "/committees/my-committees",
                "GET"
            );

        /*
         * Support either:
         *
         * [ ... ]
         *
         * or:
         *
         * { committees: [ ... ] }
         */

        if (Array.isArray(response)) {
            return response;
        }

        if (
            response &&
            Array.isArray(
                response.committees
            )
        ) {
            return response.committees;
        }

        return [];

    } catch (error) {

        console.error(
            "❌ Failed to load Chair committees:",
            error
        );

        return [];
    }
},
    /* =====================================================
       ANNOUNCEMENT CARD
       ===================================================== */

    createAnnouncementCard(
        announcement
    ) {

        const id =
            announcement.id;


        const title =
            this.escapeHtml(
                announcement.title ||
                "Untitled Announcement"
            );


        const content =
            this.escapeHtml(
                announcement.content ||
                ""
            );


        const committee =
            this.escapeHtml(
                announcement.committeeName ||
                "Unknown Committee"
            );


        const createdBy =
            this.escapeHtml(
                announcement.createdByName ||
                "Unknown"
            );


        const status =
            String(
                announcement.status ||
                "DRAFT"
            ).toUpperCase();


        const createdAt =
            this.formatDate(
                announcement.createdAt
            );


        const publishedAt =
            this.formatDate(
                announcement.publishedAt
            );


        const statusClass =
            status.toLowerCase();


        return `
            <article
                class="announcement-card
                       announcement-${statusClass}"
                data-id="${id}"
            >

                <div class="announcement-card-header">

                    <div class="announcement-status
                                ${statusClass}">

                        <i class="
                            fa-solid
                            ${
                                status === "PUBLISHED"
                                    ? "fa-circle-check"
                                    : "fa-file-lines"
                            }
                        "></i>

                        ${status}

                    </div>


                    <div class="announcement-actions">

                        <button
                            type="button"
                            class="icon-btn"
                            title="Edit announcement"
                            onclick="
                                AnnouncementManager
                                    .openEditModal(${id})
                            "
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>


                        ${
                            status === "DRAFT"
                                ? `
                                    <button
                                        type="button"
                                        class="icon-btn publish-action"
                                        title="Publish announcement"
                                        onclick="
                                            AnnouncementManager
                                                .publishAnnouncement(${id})
                                        "
                                    >
                                        <i class="
                                            fa-solid
                                            fa-bullhorn
                                        "></i>
                                    </button>
                                `
                                : ""
                        }


                        <button
                            type="button"
                            class="icon-btn delete-action"
                            title="Delete announcement"
                            onclick="
                                AnnouncementManager
                                    .openDeleteModal(${id})
                            "
                        >
                            <i class="
                                fa-solid
                                fa-trash
                            "></i>
                        </button>

                    </div>

                </div>


                <div class="announcement-card-body">

                    <h3>
                        ${title}
                    </h3>


                    <p>
                        ${content}
                    </p>

                </div>


                <div class="announcement-card-meta">

                    <span>
                        <i class="
                            fa-solid
                            fa-building-columns
                        "></i>

                        ${committee}
                    </span>


                    <span>
                        <i class="
                            fa-solid
                            fa-user
                        "></i>

                        ${createdBy}
                    </span>


                    ${
                        createdAt
                            ? `
                                <span>
                                    <i class="
                                        fa-regular
                                        fa-clock
                                    "></i>

                                    ${createdAt}
                                </span>
                              `
                            : ""
                    }

                </div>


                ${
                    publishedAt
                        ? `
                            <div class="
                                announcement-published
                            ">
                                <i class="
                                    fa-solid
                                    fa-check
                                "></i>

                                Published ${publishedAt}
                            </div>
                          `
                        : ""
                }

            </article>
        `;
    },


    /* =====================================================
       CREATE MODAL
       ===================================================== */

    async openCreateModal() {

        this.currentAnnouncementId = null;


        const modal =
            document.getElementById(
                "announcementModal"
            );


        const form =
            document.getElementById(
                "announcementForm"
            );


        if (!modal) {
            return;
        }


        if (form) {
            form.reset();
        }


        const title =
            document.getElementById(
                "announcementModalTitle"
            );


        if (title) {

            title.textContent =
                "New Announcement";
        }


        const status =
            document.getElementById(
                "announcementStatus"
            );


        if (status) {

            status.value =
                "DRAFT";

            /*
             * Status is intentionally disabled.
             *
             * Backend always creates announcements
             * as DRAFT.
             */

            status.disabled = true;
        }


await this.prepareCommitteeField();

this.configureAudienceField();
const audience =
    document.getElementById(
        "announcementAudience"
    );

if (audience) {

    audience.value =
        "CHAIRS_AND_DELEGATES";
}
this.setButtonText(
    "saveAnnouncementBtn",
    "Save Announcement"
);


        modal.classList.remove(
            "hidden"
        );


        this.focusField(
            "announcementTitle"
        );
    },


    /* =====================================================
       EDIT MODAL
       ===================================================== */

    openEditModal(id) {

        const announcement =
            this.announcements.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!announcement) {

            this.showError(
                "Announcement not found."
            );

            return;
        }


        this.currentAnnouncementId =
            announcement.id;


        const modal =
            document.getElementById(
                "announcementModal"
            );


        if (!modal) {
            return;
        }


        const title =
            document.getElementById(
                "announcementModalTitle"
            );


        if (title) {

            title.textContent =
                "Edit Announcement";
        }


        const announcementTitle =
            document.getElementById(
                "announcementTitle"
            );


        if (announcementTitle) {

            announcementTitle.value =
                announcement.title || "";
        }


        const content =
            document.getElementById(
                "announcementContent"
            );


        if (content) {

            content.value =
                announcement.content || "";
        }


        const committee =
            document.getElementById(
                "announcementCommittee"
            );


        if (committee) {

            committee.value =
                announcement.committeeId || "";

            committee.disabled = true;
        }

const audience =
    document.getElementById(
        "announcementAudience"
    );

if (audience) {

    this.configureAudienceField();

    audience.value =
        announcement.audience ||
        "CHAIRS_AND_DELEGATES";
}
        const status =
            document.getElementById(
                "announcementStatus"
            );


        if (status) {

            status.value =
                announcement.status ||
                "DRAFT";

            status.disabled = true;
        }


        this.setButtonText(
            "saveAnnouncementBtn",
            "Update Announcement"
        );


        modal.classList.remove(
            "hidden"
        );


        this.focusField(
            "announcementTitle"
        );
    },


    /* =====================================================
       SAVE / UPDATE
       ===================================================== */

async saveAnnouncement() {

    const isUpdate =
        this.currentAnnouncementId !== null;

    const title =
        document.getElementById(
            "announcementTitle"
        )?.value.trim();

    const content =
        document.getElementById(
            "announcementContent"
        )?.value.trim();

    const committee =
        document.getElementById(
            "announcementCommittee"
        );

    const audience =
        document.getElementById(
            "announcementAudience"
        );


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!title) {

        this.showError(
            "Announcement title is required."
        );

        return;
    }


    if (!content) {

        this.showError(
            "Announcement content is required."
        );

        return;
    }


    if (
        !audience ||
        !audience.value
    ) {

        this.showError(
            "Please select an audience."
        );

        return;
    }


    // =====================================================
    // PAYLOAD
    // =====================================================

    const payload = {

        title: title,

        content: content,

        audience:
            audience.value
    };


    // =====================================================
    // CREATE
    // =====================================================

    if (!isUpdate) {

        // -----------------------------
        // ADMIN
        // -----------------------------

        if (
            this.getRole() === "ADMIN"
        ) {

            if (
                committee &&
                committee.value
            ) {

                payload.committeeId =
                    Number(
                        committee.value
                    );

            } else {

                // Empty committee = GLOBAL
                payload.committeeId = null;
            }
        }


        // -----------------------------
        // CHAIR
        // -----------------------------

        else if (
            this.getRole() === "CHAIR"
        ) {

            if (
                committee &&
                committee.value
            ) {

                payload.committeeId =
                    Number(
                        committee.value
                    );

            } else {

                this.showError(
                    "Please select a committee."
                );

                return;
            }
        }
    }


    // =====================================================
    // UPDATE
    // =====================================================

    else {

        /*
         * Preserve the announcement's existing
         * committee when editing.
         */

        if (
            committee &&
            committee.value
        ) {

            payload.committeeId =
                Number(
                    committee.value
                );

        } else {

            payload.committeeId = null;
        }
    }


    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
        "📢 FINAL ANNOUNCEMENT PAYLOAD:",
        payload
    );


    // =====================================================
    // SAVE
    // =====================================================

    this.setSavingState(true);

    try {

        let response;


        if (isUpdate) {

            response =
                await apiRequest(
                    `/announcements/${this.currentAnnouncementId}`,
                    "PUT",
                    payload
                );

        } else {

            response =
                await apiRequest(
                    "/announcements",
                    "POST",
                    payload
                );
        }


        console.log(
            "✅ Announcement saved:",
            response
        );


        // Close modal
        this.closeModal();


        this.showSuccess(
            isUpdate
                ? "Announcement updated successfully."
                : "Announcement created successfully."
        );


        await this.loadAnnouncements();


    } catch (error) {

        console.error(
            "❌ Save announcement error:",
            error
        );


        this.showError(
            this.getErrorMessage(
                error,
                "Failed to save announcement."
            )
        );

    } finally {

        this.setSavingState(
            false
        );
    }
},


    /* =====================================================
       PUBLISH
       ===================================================== */

    async publishAnnouncement(id) {

        const announcement =
            this.announcements.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!announcement) {
            return;
        }


        const confirmed =
            window.confirm(
                `Publish "${announcement.title}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

await apiRequest(
    `/announcements/${id}/publish`,
    "PUT"
);


            this.showSuccess(
                "Announcement published successfully."
            );


            await this.loadAnnouncements();


        } catch (error) {

            console.error(
                "❌ Publish error:",
                error
            );


            this.showError(
                this.getErrorMessage(
                    error,
                    "Failed to publish announcement."
                )
            );
        }
    },


    /* =====================================================
       DELETE MODAL
       ===================================================== */

    openDeleteModal(id) {

        const announcement =
            this.announcements.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!announcement) {
            return;
        }


        this.deleteAnnouncementId =
            announcement.id;


        const modal =
            document.getElementById(
                "deleteAnnouncementModal"
            );


        if (modal) {

            modal.classList.remove(
                "hidden"
            );
        }
    },


    closeDeleteModal() {

        const modal =
            document.getElementById(
                "deleteAnnouncementModal"
            );


        if (modal) {

            modal.classList.add(
                "hidden"
            );
        }


        this.deleteAnnouncementId =
            null;
    },


    async confirmDelete() {

        if (
            this.deleteAnnouncementId === null
        ) {
            return;
        }


        const id =
            this.deleteAnnouncementId;


        try {

            const button =
                document.getElementById(
                    "confirmDeleteAnnouncement"
                );


            if (button) {
                button.disabled = true;
            }


await apiRequest(
    `/announcements/${id}`,
    "DELETE"
);


            this.closeDeleteModal();


            this.showSuccess(
                "Announcement deleted successfully."
            );


            await this.loadAnnouncements();


        } catch (error) {

            console.error(
                "❌ Delete announcement error:",
                error
            );


            this.showError(
                this.getErrorMessage(
                    error,
                    "Failed to delete announcement."
                )
            );

        } finally {

            const button =
                document.getElementById(
                    "confirmDeleteAnnouncement"
                );


            if (button) {
                button.disabled = false;
            }
        }
    },


    /* =====================================================
       CLOSE CREATE / EDIT MODAL
       ===================================================== */

    closeModal() {

        const modal =
            document.getElementById(
                "announcementModal"
            );


        if (modal) {

            modal.classList.add(
                "hidden"
            );
        }


        const form =
            document.getElementById(
                "announcementForm"
            );


        if (form) {
            form.reset();
        }


        const committee =
            document.getElementById(
                "announcementCommittee"
            );


        if (committee) {
            committee.disabled = false;
        }


        const status =
            document.getElementById(
                "announcementStatus"
            );


        if (status) {
            status.disabled = false;
            status.value = "DRAFT";
        }


        this.currentAnnouncementId =
            null;


        this.setButtonText(
            "saveAnnouncementBtn",
            "Save Announcement"
        );
    },


    /* =====================================================
       REFRESH
       ===================================================== */

    async refresh() {

        const button =
            document.getElementById(
                "refreshAnnouncements"
            );


        if (button) {

            button.disabled = true;

            button.classList.add(
                "is-loading"
            );
        }


        try {

            await this.loadAnnouncements();

            await this.loadCommittees();

            this.showSuccess(
                "Announcements refreshed."
            );

        } finally {

            if (button) {

                button.disabled = false;

                button.classList.remove(
                    "is-loading"
                );
            }
        }
    },


    /* =====================================================
       STATISTICS
       ===================================================== */

    updateStats() {

        const total =
            this.announcements.length;


        const published =
            this.announcements.filter(
                announcement =>
                    String(
                        announcement.status
                    ).toUpperCase() ===
                    "PUBLISHED"
            ).length;


        const drafts =
            this.announcements.filter(
                announcement =>
                    String(
                        announcement.status
                    ).toUpperCase() ===
                    "DRAFT"
            ).length;


        const committeeIds =
            new Set(
                this.announcements
                    .map(
                        announcement =>
                            announcement.committeeId
                    )
                    .filter(
                        id =>
                            id !== null &&
                            id !== undefined
                    )
            );


        this.setText(
            "totalAnnouncements",
            total
        );


        this.setText(
            "publishedAnnouncements",
            published
        );


        this.setText(
            "draftAnnouncements",
            drafts
        );


        this.setText(
            "committeeAnnouncementCount",
            committeeIds.size
        );
    },


    /* =====================================================
       LOADING
       ===================================================== */

    showLoading() {

        const overlay =
            document.getElementById(
                "loadingOverlay"
            );


        if (overlay) {

            overlay.classList.remove(
                "hidden"
            );
        }
    },


    hideLoading() {

        const overlay =
            document.getElementById(
                "loadingOverlay"
            );


        if (overlay) {

            overlay.classList.add(
                "hidden"
            );
        }
    },


    /* =====================================================
       SAVING STATE
       ===================================================== */

    setSavingState(isSaving) {

        const button =
            document.getElementById(
                "saveAnnouncementBtn"
            );


        if (!button) {
            return;
        }


        if (isSaving) {

            button.disabled = true;

            button.dataset.originalText =
                button.textContent.trim();

            button.innerHTML = `
                <i class="
                    fa-solid
                    fa-spinner
                    fa-spin
                "></i>

                Saving...
            `;

        } else {

            button.disabled = false;

            const text =
                button.dataset.originalText ||
                "Save Announcement";

            button.innerHTML = `
                <i class="
                    fa-solid
                    fa-save
                "></i>

                ${this.escapeHtml(text)}
            `;
        }
    },


    /* =====================================================
       HELPERS
       ===================================================== */

    normalizeList(response) {

        if (Array.isArray(response)) {
            return response;
        }

        if (
            response &&
            Array.isArray(response.content)
        ) {
            return response.content;
        }

        if (
            response &&
            Array.isArray(response.data)
        ) {
            return response.data;
        }

        if (
            response &&
            Array.isArray(response.announcements)
        ) {
            return response.announcements;
        }

        return [];
    },


    setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                value;
        }
    },


    setButtonText(id, text) {

        const button =
            document.getElementById(id);

        if (!button) {
            return;
        }

        button.innerHTML = `
            <i class="
                fa-solid
                fa-save
            "></i>

            ${this.escapeHtml(text)}
        `;
    },


    focusField(id) {

        setTimeout(() => {

            const field =
                document.getElementById(id);

            if (field) {
                field.focus();
            }

        }, 100);
    },


    formatDate(value) {

        if (!value) {
            return "";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    },


    escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
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
    },


    getErrorMessage(
        error,
        fallback
    ) {

        if (!error) {
            return fallback;
        }


        if (
            typeof error ===
            "string"
        ) {
            return error;
        }


        if (error.message) {
            return error.message;
        }


        if (error.error) {
            return error.error;
        }


        if (
            error.data &&
            error.data.message
        ) {
            return error.data.message;
        }


        return fallback;
    },


    /* =====================================================
       TOAST
       ===================================================== */

    showSuccess(message) {

        this.showToast(
            message,
            "success"
        );
    },


    showError(message) {

        this.showToast(
            message,
            "error"
        );
    },


    showToast(
        message,
        type = "info"
    ) {

        let container =
            document.getElementById(
                "toastContainer"
            );


        if (!container) {

            container =
                document.createElement(
                    "div"
                );

            container.id =
                "toastContainer";

            container.className =
                "toast-container";

            document.body.appendChild(
                container
            );
        }


        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            `toast toast-${type}`;


        const icon =
            type === "success"
                ? "fa-check"
                : type === "error"
                    ? "fa-xmark"
                    : "fa-info";


        toast.innerHTML = `
            <i class="
                fa-solid
                ${icon}
            "></i>

            <span>
                ${this.escapeHtml(message)}
            </span>
        `;


        container.appendChild(
            toast
        );


        setTimeout(() => {

            toast.classList.add(
                "show"
            );

        }, 10);


        setTimeout(() => {

            toast.classList.remove(
                "show"
            );


            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 3500);
    }
};


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.AnnouncementManager =
    AnnouncementManager;


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            typeof apiRequest !==
            "function"
        ) {

            console.error(
                "❌ apiRequest() is not available."
            );

            return;
        }


        AnnouncementManager.init();
    }
);