const DelegateResourceManager = {

    resources: [],
    filteredResources: [],
    selectedResource: null,

    async init() {

        this.cacheDOM();
        this.registerEvents();

        await this.loadResources();

    },

    cacheDOM() {

        this.grid = document.getElementById("resourceGrid");

        this.searchInput =
            document.getElementById("searchInput");

        this.committeeFilter =
            document.getElementById("committeeFilter");

        this.categoryFilter =
            document.getElementById("categoryFilter");

        this.modal =
            document.getElementById("resourceModal");

        this.closeModalButton =
            document.getElementById("closeModal");

        this.downloadButton =
            document.getElementById("downloadBtn");

        this.externalButton =
            document.getElementById("externalBtn");

    },

    registerEvents() {

        this.searchInput.addEventListener(
            "input",
            () => this.renderResources()
        );

        this.committeeFilter.addEventListener(
            "change",
            () => this.renderResources()
        );

        this.categoryFilter.addEventListener(
            "change",
            () => this.renderResources()
        );

        this.closeModalButton.addEventListener(
            "click",
            () => this.closeModal()
        );

    },

    async loadResources() {

    try {

        this.showLoading();

        const committeeId = localStorage.getItem("committeeId");

        if (!committeeId) {
            Utils.showToast("Committee not found.", "error");
            return;
        }

        this.resources = await apiRequest(
            `/delegate/resources?committeeId=${committeeId}`
        );

        this.populateFilters();
        this.updateStatistics();
        this.renderResources();

    }
    catch (error) {

        console.error(error);

        Utils.showToast(
            "Unable to load resources",
            "error"
        );

    }
    finally {

        this.hideLoading();

    }

},

    populateFilters() {

        const committees =
            [...new Set(
                this.resources.map(r => r.committeeName)
            )];

        const categories =
            [...new Set(
                this.resources.map(r => r.category)
            )];

        this.committeeFilter.innerHTML =
            '<option value="">All Committees</option>';

        committees.forEach(c => {

            this.committeeFilter.innerHTML += `
                <option value="${c}">
                    ${c}
                </option>
            `;

        });

        this.categoryFilter.innerHTML =
            '<option value="">All Categories</option>';

        categories.forEach(category => {

            this.categoryFilter.innerHTML += `
                <option value="${category}">
                    ${category}
                </option>
            `;

        });

    },

    updateStatistics() {

        document.getElementById("resourceCount").textContent =
            this.resources.length;

        document.getElementById("committeeCount").textContent =
            new Set(
                this.resources.map(r => r.committeeName)
            ).size;

        document.getElementById("categoryCount").textContent =
            new Set(
                this.resources.map(r => r.category)
            ).size;

    },

 renderResources() {

    const keyword =
        this.searchInput.value.trim().toLowerCase();

    const committee =
        this.committeeFilter.value;

    const category =
        this.categoryFilter.value;

    this.filteredResources =
        this.resources.filter(resource => {

            const title =
                (resource.title || "").toLowerCase();

            const description =
                (resource.description || "").toLowerCase();

            const matchesSearch =
                !keyword ||
                title.includes(keyword) ||
                description.includes(keyword);

            const matchesCommittee =
                !committee ||
                resource.committeeName === committee;

            const matchesCategory =
                !category ||
                resource.category === category;

            return (
                matchesSearch &&
                matchesCommittee &&
                matchesCategory
            );

        });


    /* -----------------------------------------
       UPDATE RESULT COUNT
       ----------------------------------------- */

    const resultsCount =
        document.getElementById("resultsCount");

    if (resultsCount) {

        const count =
            this.filteredResources.length;

        resultsCount.textContent =
            `${count} ${count === 1 ? "Resource" : "Resources"}`;
    }


    /* -----------------------------------------
       CLEAR GRID
       ----------------------------------------- */

    this.grid.innerHTML = "";


    /* -----------------------------------------
       EMPTY STATE
       ----------------------------------------- */

    const emptyState =
        document.getElementById("emptyState");

    if (this.filteredResources.length === 0) {

        emptyState?.classList.remove("hidden");

        return;
    }

    emptyState?.classList.add("hidden");


    /* -----------------------------------------
       RENDER CARDS
       ----------------------------------------- */

    this.filteredResources.forEach(resource => {

        this.grid.appendChild(
            this.createCard(resource)
        );

    });

},

    formatCategory(category) {

    return (category || "General")
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

},

    createCard(resource) {

        const card =
            document.createElement("div");

        card.className =
            "resource-card";

const formattedCategory =
    this.formatCategory(resource.category);

    
        card.innerHTML = `

            <div class="resource-header">

                <h3>${resource.title}</h3>

                <span class="badge">

                    ${formattedCategory}

                </span>

            </div>

            <p>

                ${resource.description || "No description"}

            </p>

           <div class="resource-meta">

    <p>

        <strong>Committee</strong>

        <span>${resource.committeeName}</span>

    </p>

    <p>

        <strong>Version</strong>

        <span>v${resource.version}</span>

    </p>

    <p>

        <strong>Uploaded By</strong>

        <span>${resource.uploadedByName}</span>

    </p>

</div>

            <div class="resource-actions">

                <button
                    class="btn btn-primary"
                    onclick="DelegateResourceManager.openModal(${resource.id})">

                    <i class="fa-solid fa-eye"></i>

                    View

                </button>

            </div>

        `;

        return card;

    },

    openModal(id) {

        this.selectedResource =
            this.resources.find(r => r.id === id);

        if (!this.selectedResource)
            return;

        document.getElementById("modalTitle").textContent =
            this.selectedResource.title;

        document.getElementById("modalCommittee").textContent =
            this.selectedResource.committeeName;

        document.getElementById("modalCategory").textContent =
    this.formatCategory(this.selectedResource.category);

        document.getElementById("modalAuthor").textContent =
            this.selectedResource.uploadedByName;

        document.getElementById("modalVersion").textContent =
            this.selectedResource.version;

        document.getElementById("modalDescription").textContent =
            this.selectedResource.description || "";

        this.downloadButton.onclick =
            () => this.download();

        this.externalButton.onclick =
            () => this.openExternal();

        this.modal.classList.remove("hidden");

    },

    closeModal() {

        this.modal.classList.add("hidden");

        this.selectedResource = null;

    },

    download() {

        if (!this.selectedResource)
            return;

        window.open(

            `${CONFIG.API_BASE_URL}/delegate/resources/${this.selectedResource.id}/download`,

            "_blank"

        );

    },

    openExternal() {

        if (
            this.selectedResource &&
            this.selectedResource.externalLink
        ) {

            window.open(
                this.selectedResource.externalLink,
                "_blank"
            );

        }
        else {

            Utils.showToast(
                "No external link available.",
                "warning"
            );

        }

    },

    showLoading() {

        document
            .getElementById("loadingOverlay")
            ?.classList.remove("hidden");

    },

    hideLoading() {

        document
            .getElementById("loadingOverlay")
            ?.classList.add("hidden");

    }

};

document.addEventListener(

    "DOMContentLoaded",

    () => DelegateResourceManager.init()

);