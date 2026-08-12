document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!Auth.isLoggedIn()) {

            window.location.href =
                "../login.html";

            return;

        }

        await loadCertificateStats();

        await loadCommittees();

        await loadRecentCertificates();

        initializePreview();

    }
);


// ==========================
// STATS
// ==========================

async function loadCertificateStats() {

    try {

        const stats =
            await apiRequest(
                "/certificates/stats"
            );

        setText(
            "totalCertificates",
            stats.totalCertificates
        );

        setText(
            "totalEvents",
            stats.totalEvents
        );

        setText(
            "awardCertificates",
            stats.awardCertificates
        );

        setText(
            "participationCertificates",
            stats.participationCertificates
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
                "committeeSelect"
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
// GENERATE CERTIFICATE
// ==========================

async function generateCertificate(event) {

    event.preventDefault();

    const certificate = {

        recipient:
            document.getElementById(
                "recipientName"
            ).value,

        committeeId:
            document.getElementById(
                "committeeSelect"
            ).value,

        type:
            document.getElementById(
                "certificateType"
            ).value,

        eventDate:
            document.getElementById(
                "eventDate"
            ).value

    };

    try {

        await apiRequest(
            "/certificates/generate",
            "POST",
            certificate
        );

        alert(
            "Certificate Generated"
        );

        await loadRecentCertificates();

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// BULK GENERATION
// ==========================

async function generateParticipationCertificates() {

    try {

        await apiRequest(
            "/certificates/bulk/participation",
            "POST"
        );

        alert(
            "Participation Certificates Generated"
        );

        await loadRecentCertificates();

    }
    catch(error){

        console.error(error);

    }

}


async function generateAwardCertificates() {

    try {

        await apiRequest(
            "/certificates/bulk/awards",
            "POST"
        );

        alert(
            "Award Certificates Generated"
        );

        await loadRecentCertificates();

    }
    catch(error){

        console.error(error);

    }

}


async function generateChairCertificates() {

    try {

        await apiRequest(
            "/certificates/bulk/chairs",
            "POST"
        );

        alert(
            "Chair Certificates Generated"
        );

        await loadRecentCertificates();

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// EXPORT ZIP
// ==========================

function exportZipPackage() {

    window.open(
        `${CONFIG.API_BASE_URL}/certificates/export-zip`,
        "_blank"
    );

}


function exportAllPDFs() {

    window.open(
        `${CONFIG.API_BASE_URL}/certificates/export-all`,
        "_blank"
    );

}


// ==========================
// RECENT CERTIFICATES
// ==========================

async function loadRecentCertificates() {

    try {

        const certificates =
            await apiRequest(
                "/certificates/recent"
            );

        const tbody =
            document.getElementById(
                "certificateTableBody"
            );

        if(!tbody) return;

        tbody.innerHTML = "";

        certificates.forEach(cert => {

            tbody.innerHTML += `

                <tr>

                    <td>${cert.recipient}</td>

                    <td>${cert.committee}</td>

                    <td>${cert.type}</td>

                    <td>${cert.date}</td>

                    <td>

                        <button
                        class="download"
                        onclick="downloadCertificate(${cert.id})">

                        Download

                        </button>

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
// DOWNLOAD CERTIFICATE
// ==========================

function downloadCertificate(id) {

    window.open(
        `${CONFIG.API_BASE_URL}/certificates/${id}/download`,
        "_blank"
    );

}


// ==========================
// LIVE PREVIEW
// ==========================

function initializePreview() {

    const recipient =
        document.getElementById(
            "recipientName"
        );

    const type =
        document.getElementById(
            "certificateType"
        );

    if(recipient){

        recipient.addEventListener(
            "input",
            updatePreview
        );

    }

    if(type){

        type.addEventListener(
            "change",
            updatePreview
        );

    }

}


function updatePreview() {

    const recipientName =
        document.getElementById(
            "recipientName"
        )?.value
        || "Recipient Name";

    const certificateType =
        document.getElementById(
            "certificateType"
        )?.value
        || "Participation";

    setText(
        "previewRecipient",
        recipientName
    );

    setText(
        "previewAward",
        certificateType
    );

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