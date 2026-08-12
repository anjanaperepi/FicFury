const ResourceManager = {

    resources: [],
    committees: [],
    editingId: null,

    async init() {

        this.cacheDOM();

        this.registerEvents();

        await this.loadCommittees();

        await this.loadResources();

    },

    cacheDOM() {

        this.grid = document.getElementById("resourceGrid");

        this.searchInput = document.getElementById("searchInput");

        this.committeeFilter = document.getElementById("committeeFilter");

        this.statusFilter = document.getElementById("statusFilter");

        this.uploadForm = document.getElementById("uploadForm");

        this.modal = document.getElementById("uploadModal");

    },

    registerEvents() {

        document
            .getElementById("openUploadModal")
            .addEventListener("click", () => this.openModal());

        document
            .getElementById("closeModal")
            .addEventListener("click", () => this.closeModal());

        document
            .getElementById("cancelUpload")
            .addEventListener("click", () => this.closeModal());

this.uploadForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        if (this.editingId) {

            await this.updateResource();

        } else {

            await this.uploadResource(event);

        }

    }
);

        this.searchInput.addEventListener(
            "input",
            () => this.renderResources()
        );

        this.committeeFilter.addEventListener(
            "change",
            () => this.renderResources()
        );

        this.statusFilter.addEventListener(
            "change",
            () => this.renderResources()
        );

    },

openModal() {

    this.editingId = null;

    this.uploadForm.reset();

    this.modal.classList.remove("hidden");

},

closeModal() {

    this.modal.classList.add("hidden");

    this.uploadForm.reset();

    this.editingId = null;

},

   async loadCommittees() {

    try {

        const committees = await apiRequest("/committees");

        this.committees = committees;

        const committeeSelect =
            document.getElementById("committee");

        committeeSelect.innerHTML =
            '<option value="">Select Committee</option>';

        this.committeeFilter.innerHTML =
            '<option value="">All Committees</option>';

        committees.forEach(c => {

            committeeSelect.innerHTML += `
                <option value="${c.id}">
                    ${c.name}
                </option>
            `;

            this.committeeFilter.innerHTML += `
                <option value="${c.id}">
                    ${c.name}
                </option>
            `;

        });

    }

    catch (error) {

        console.error(error);

        Utils.showToast(
            "Unable to load committees",
            "error"
        );

    }

},

    async loadResources() {

        try {

            this.resources = await apiRequest(
                "/chair/resources"
            );

            this.renderResources();

        }

        catch (err) {

            console.error(err);

            alert("Unable to load resources.");

        }

    },

    renderResources() {

        const keyword =
            this.searchInput.value.toLowerCase();

        const committee =
            this.committeeFilter.value;

        const status =
            this.statusFilter.value;

        const filtered = this.resources.filter(r => {

            const matchesSearch =
                r.title.toLowerCase().includes(keyword);

            const matchesCommittee =
                !committee ||
                r.committeeId == committee;

            const matchesStatus =
                !status ||
                r.status === status;

            return matchesSearch &&
                   matchesCommittee &&
                   matchesStatus;

        });

        this.grid.innerHTML = "";

        if (filtered.length === 0) {

            this.grid.innerHTML =
                "<p>No resources found.</p>";

            return;

        }

        filtered.forEach(r => {

            this.grid.appendChild(
                this.createCard(r)
            );

        });

    },

    createCard(resource) {

    const card = document.createElement("div");

    card.className = "resource-card";

    card.innerHTML = `

        <div class="resource-header">

            <h3>${resource.title}</h3>

            <span class="status ${resource.status.toLowerCase()}">

                ${resource.status}

            </span>

        </div>

        <p>

            ${resource.description || "No description"}

        </p>

        <div class="resource-meta">

            <p>
                <strong>Committee:</strong>
                ${resource.committeeName}
            </p>

            <p>
                <strong>Category:</strong>
                ${resource.category}
            </p>

            <p>
                <strong>Version:</strong>
                ${resource.version}
            </p>

            <p>
                <strong>Uploaded By:</strong>
                ${resource.uploadedByName}
            </p>

        </div>

        ${
            resource.adminFeedback
            ?
            `
                <div class="feedback">

                    <strong>Feedback:</strong>

                    ${resource.adminFeedback}

                </div>
            `
            :
            ""
        }

        <div class="resource-actions">

            <button
                onclick="ResourceManager.view(${resource.id})">

                <i class="fa fa-eye"></i>

                View

            </button>

            ${
                resource.status === "PENDING"

                ?

                `

                <button
                    onclick="ResourceManager.edit(${resource.id})">

                    <i class="fa fa-edit"></i>

                    Edit

                </button>

                <button
                    onclick="ResourceManager.remove(${resource.id})">

                    <i class="fa fa-trash"></i>

                    Delete

                </button>

                `

                :

                ""

            }

        </div>

    `;

    return card;

},

    async uploadResource(event) {

    

    const request = {

        title: document.getElementById("title").value,

        description: document.getElementById("description").value,

        committeeId: Number(
            document.getElementById("committee").value
        ),

        category: document.getElementById("category").value,

        version: Number(
            document.getElementById("version").value
        ),

        externalLink:
            document.getElementById("externalLink").value

    };

    const formData = new FormData();

    formData.append(
        "resource",
        new Blob(
            [JSON.stringify(request)],
            {
                type: "application/json"
            }
        )
    );

    const file =
        document.getElementById("file").files[0];

    if (file) {

        formData.append(
            "file",
            file
        );

    }

    try {

        await apiRequest(
            "/chair/resources",
            "POST",
            formData,
            true
        );

        Utils.showToast(
            "Resource uploaded successfully",
            "success"
        );

        this.closeModal();

        await this.loadResources();

    }

    catch (error) {

        console.error(error);

    }

},

    async remove(id) {

        if (!confirm("Delete this resource?")) {

            return;

        }

        try {

            await apiRequest(
                `/chair/resources/${id}`,
                {
                    method: "DELETE"
                }
            );

            await this.loadResources();

        }

        catch (err) {

            console.error(err);

            alert("Delete failed.");

        }

    },

    view(id) {

        window.open(
            `${CONFIG.API_BASE_URL}/chair/resources/${id}/download`,
            "_blank"
        );

    },

    async edit(id) {

    try {

        const resource =
            await apiRequest(`/chair/resources/${id}`);

        this.editingId = id;

        document.getElementById("title").value =
            resource.title;

        document.getElementById("description").value =
            resource.description || "";

        document.getElementById("committee").value =
            resource.committeeId;

        document.getElementById("category").value =
            resource.category;

        document.getElementById("externalLink").value =
            resource.externalLink || "";

        document.getElementById("version").value =
            resource.version;

        document.getElementById("uploadModal")
            .classList.add("show");

    }

    catch(error){

        console.error(error);

        Utils.showToast(
            "Unable to load resource",
            "error"
        );

    }

},
async updateResource(){

    const request = {

        title:
            document.getElementById("title").value,

        description:
            document.getElementById("description").value,

        committeeId:
            Number(document.getElementById("committee").value),

        category:
            document.getElementById("category").value,

        version:
            Number(document.getElementById("version").value),

        externalLink:
            document.getElementById("externalLink").value

    };

    const formData = new FormData();

    formData.append(
        "resource",
        new Blob(
            [JSON.stringify(request)],
            {type:"application/json"}
        )
    );

    const file =
        document.getElementById("file").files[0];

    if(file){

        formData.append("file", file);

    }

    await apiRequest(

        `/chair/resources/${this.editingId}`,

        "PUT",

        formData,

        true

    );

    this.editingId = null;

    this.closeModal();

    await this.loadResources();

    Utils.showToast(
        "Resource updated successfully",
        "success"
    );

}
};

document.addEventListener(
    "DOMContentLoaded",
    () => ResourceManager.init()
);