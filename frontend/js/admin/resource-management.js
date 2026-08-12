document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!Auth.isLoggedIn()) {

            window.location.href =
                "../login.html";

            return;

        }

        await loadResourceStats();

        await loadCommittees();

        await loadResources();

        await loadDownloadActivity();

    }
);


// ==========================
// RESOURCE STATS
// ==========================

async function loadResourceStats() {

    try {

        const stats =
            await apiRequest(
                "/resources/stats"
            );

        setText(
            "totalResources",
            stats.totalResources
        );

        setText(
            "totalCommittees",
            stats.totalCommittees
        );

        setText(
            "totalDownloads",
            stats.totalDownloads
        );

        setText(
            "storageUsed",
            stats.storageUsed
        );

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// LOAD COMMITTEES
// ==========================

async function loadCommittees() {

    try {

        const committees =
            await apiRequest(
                "/committees"
            );

        const select =
            document.getElementById(
                "resourceCommittee"
            );

        if(!select) return;

        select.innerHTML =
            '<option value="">Select Committee</option>';

        committees.forEach(committee => {

            select.innerHTML += `
                <option value="${committee.id}">
                    ${committee.name}
                </option>
            `;

        });

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// UPLOAD RESOURCE
// ==========================

async function uploadResource(event) {

    event.preventDefault();

    const formData =
        new FormData();

    formData.append(
        "title",
        document.getElementById(
            "resourceTitle"
        ).value
    );

    formData.append(
        "committeeId",
        document.getElementById(
            "resourceCommittee"
        ).value
    );

    formData.append(
        "type",
        document.getElementById(
            "resourceType"
        ).value
    );

    formData.append(
        "description",
        document.getElementById(
            "resourceDescription"
        ).value
    );

    formData.append(
        "file",
        document.getElementById(
            "resourceFile"
        ).files[0]
    );

    try {

        const token =
            localStorage.getItem(
                CONFIG.TOKEN_KEY
            );

        await fetch(
            `${CONFIG.API_BASE_URL}/resources/upload`,
            {
                method: "POST",
                headers: {
                    Authorization:
                    `Bearer ${token}`
                },
                body: formData
            }
        );

        alert(
            "Resource Uploaded"
        );

        await loadResources();

        await loadResourceStats();

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// LOAD RESOURCES
// ==========================

async function loadResources() {

    try {

        const resources =
            await apiRequest(
                "/resources"
            );

        const container =
            document.getElementById(
                "resourceGrid"
            );

        if(!container) return;

        container.innerHTML = "";

        resources.forEach(resource => {

            container.innerHTML += `

                <div class="resource-card">

                    <div class="resource-icon">
                        📄
                    </div>

                    <h3>
                        ${resource.title}
                    </h3>

                    <p>
                        ${resource.description}
                    </p>

                    <span>
                        ${resource.fileType}
                        •
                        ${resource.fileSize}
                    </span>

                    <div class="resource-actions">

                        <button
                        class="view"
                        onclick="viewResource(${resource.id})">

                        View

                        </button>

                        <button
                        class="edit"
                        onclick="editResource(${resource.id})">

                        Edit

                        </button>

                        <button
                        class="delete"
                        onclick="deleteResource(${resource.id})">

                        Delete

                        </button>

                    </div>

                </div>

            `;

        });

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// VIEW RESOURCE
// ==========================

function viewResource(id) {

    window.open(
        `${CONFIG.API_BASE_URL}/resources/${id}/view`,
        "_blank"
    );

}


// ==========================
// EDIT RESOURCE
// ==========================

async function editResource(id) {

    try {

        const resource =
            await apiRequest(
                `/resources/${id}`
            );

        document.getElementById(
            "resourceTitle"
        ).value =
            resource.title;

        document.getElementById(
            "resourceDescription"
        ).value =
            resource.description;

        document.getElementById(
            "resourceCommittee"
        ).value =
            resource.committeeId;

        document.getElementById(
            "resourceType"
        ).value =
            resource.type;

        document.getElementById(
            "updateResourceBtn"
        ).dataset.id = id;

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// UPDATE RESOURCE
// ==========================

async function updateResource() {

    const id =
        document.getElementById(
            "updateResourceBtn"
        ).dataset.id;

    if(!id) return;

    try {

        await apiRequest(
            `/resources/${id}`,
            "PUT",
            {
                title:
                document.getElementById(
                    "resourceTitle"
                ).value,

                description:
                document.getElementById(
                    "resourceDescription"
                ).value,

                committeeId:
                document.getElementById(
                    "resourceCommittee"
                ).value,

                type:
                document.getElementById(
                    "resourceType"
                ).value
            }
        );

        alert(
            "Resource Updated"
        );

        await loadResources();

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// DELETE RESOURCE
// ==========================

async function deleteResource(id) {

    const confirmDelete =
        confirm(
            "Delete this resource?"
        );

    if(!confirmDelete)
        return;

    try {

        await apiRequest(
            `/resources/${id}`,
            "DELETE"
        );

        await loadResources();

        await loadResourceStats();

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// DOWNLOAD ACTIVITY
// ==========================

async function loadDownloadActivity() {

    try {

        const activity =
            await apiRequest(
                "/resources/download-activity"
            );

        const tbody =
            document.getElementById(
                "downloadActivityBody"
            );

        if(!tbody) return;

        tbody.innerHTML = "";

        activity.forEach(item => {

            tbody.innerHTML += `

                <tr>

                    <td>
                        ${item.resource}
                    </td>

                    <td>
                        ${item.committee}
                    </td>

                    <td>
                        ${item.downloads}
                    </td>

                    <td>
                        ${item.lastAccessed}
                    </td>

                </tr>

            `;

        });

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// HELPERS
// ==========================

function setText(id,value){

    const element =
        document.getElementById(id);

    if(element){

        element.textContent =
            value;

    }

}