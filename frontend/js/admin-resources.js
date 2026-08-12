const AdminResourceManager = {

    resources: [],
    filteredResources: [],

    async init() {

        this.cacheDOM();
        this.registerEvents();

        await this.loadResources();

    },

    cacheDOM() {

        this.grid = document.getElementById("resourceGrid");
        this.search = document.getElementById("searchInput");
        this.status = document.getElementById("statusFilter");
        this.committee = document.getElementById("committeeFilter");

    },

    registerEvents() {

        this.search.addEventListener(
            "input",
            () => this.render()
        );

        this.status.addEventListener(
            "change",
            () => this.render()
        );

        this.committee.addEventListener(
            "change",
            () => this.render()
        );

    },

    async loadResources() {

        try {

            this.resources = await apiRequest(
                "/admin/resources"
            );

            this.populateCommitteeFilter();

            this.render();

        }
        catch(error){

            console.error(error);

            Utils.showToast(
                "Unable to load resources",
                "error"
            );

        }

    },

    populateCommitteeFilter(){

        const committees =
            [...new Set(
                this.resources.map(r => r.committeeName)
            )];

        this.committee.innerHTML =
            `<option value="">All Committees</option>`;

        committees.forEach(name=>{

            this.committee.innerHTML +=
                `<option value="${name}">
                    ${name}
                </option>`;

        });

    },

    render(){

        const keyword =
            this.search.value.toLowerCase();

        const status =
            this.status.value;

        const committee =
            this.committee.value;

        this.filteredResources =
            this.resources.filter(r=>{

                const matchesSearch =
                    r.title.toLowerCase()
                        .includes(keyword);

                const matchesStatus =
                    !status ||
                    r.status===status;

                const matchesCommittee =
                    !committee ||
                    r.committeeName===committee;

                return matchesSearch &&
                       matchesStatus &&
                       matchesCommittee;

            });

        this.grid.innerHTML="";

        if(this.filteredResources.length===0){

            this.grid.innerHTML=
                "<p>No resources found.</p>";

            return;

        }

        this.filteredResources.forEach(resource=>{

            this.grid.appendChild(
                this.createCard(resource)
            );

        });

    },

    createCard(resource){

        const card=document.createElement("div");

        card.className="resource-card";

        card.innerHTML=`

            <h3>${resource.title}</h3>

            <p>${resource.description ?? ""}</p>

            <p><strong>Committee:</strong>
            ${resource.committeeName}</p>

            <p><strong>Category:</strong>
            ${resource.category}</p>

            <p><strong>Status:</strong>
            ${resource.status}</p>

            <div class="resource-actions">

                <button onclick="AdminResourceManager.view(${resource.id})">
                    View
                </button>

                <button onclick="AdminResourceManager.approve(${resource.id})">
                    Approve
                </button>

                <button onclick="AdminResourceManager.reject(${resource.id})">
                    Reject
                </button>

                <button onclick="AdminResourceManager.remove(${resource.id})">
                    Delete
                </button>

            </div>

        `;

        return card;

    },

    view(id){

        window.open(
            `${CONFIG.API_BASE_URL}/admin/resources/${id}/download`,
            "_blank"
        );

    },

    async approve(id){

        try{

            await apiRequest(
                `/admin/resources/${id}/approve`,
                "PUT"
            );

            Utils.showToast(
                "Resource approved",
                "success"
            );

            await this.loadResources();

        }
        catch(error){

            console.error(error);

        }

    },

    async reject(id){

        const feedback =
            prompt("Reason for rejection:");

        if(!feedback) return;

        try{

            await apiRequest(
                `/admin/resources/${id}/reject?feedback=${encodeURIComponent(feedback)}`,
                "PUT"
            );

            Utils.showToast(
                "Resource rejected",
                "success"
            );

            await this.loadResources();

        }
        catch(error){

            console.error(error);

        }

    },

    async remove(id){

        if(!confirm("Delete this resource?"))
            return;

        try{

            await apiRequest(
                `/admin/resources/${id}`,
                "DELETE"
            );

            Utils.showToast(
                "Resource deleted",
                "success"
            );

            await this.loadResources();

        }
        catch(error){

            console.error(error);

        }

    }

};

document.addEventListener(
    "DOMContentLoaded",
    ()=>AdminResourceManager.init()
);