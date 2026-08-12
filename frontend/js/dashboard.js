

const API_BASE = "http://localhost:8080/api";

const currentUser = getCurrentUser();
const token = getToken();

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

    loadCertificateEligibility();

});



async function initializeDashboard() {

    try {

        const user =
            Auth.getCurrentUser();

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        const dashboard =
            await apiRequest(
                "/dashboard/delegate"
            );


        populateDashboard(
            dashboard
        );


        await loadAnnouncements();

    } catch (error) {

        console.error(
            "Delegate Dashboard initialization failed:",
            error
        );

    }
}
async function loadAnnouncements() {

    const container =
        document.getElementById(
            "announcementFeed"
        );


    if (!container) {
        return;
    }


    try {

        const announcements =
            await apiRequest(
                "/announcements/my",
                "GET"
            );


        console.log(
            "📢 Delegate announcements:",
            announcements
        );


        if (
            !announcements ||
            announcements.length === 0
        ) {

            container.innerHTML = `

                <div class="activity-item">

                    <div class="activity-icon">
                        <i class="fa-solid fa-bullhorn"></i>
                    </div>

                    <div>

                        <strong>
                            No announcements
                        </strong>

                        <p>
                            There are currently no announcements
                            for you.
                        </p>

                    </div>

                </div>

            `;

            return;
        }


        container.innerHTML =
            announcements
                .map(
                    announcement =>
                        createAnnouncementItem(
                            announcement
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            "❌ Failed to load announcements:",
            error
        );


        container.innerHTML = `

            <div class="activity-item">

                <div class="activity-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>

                <div>

                    <strong>
                        Unable to load announcements
                    </strong>

                    <p>
                        Please refresh the dashboard.
                    </p>

                </div>

            </div>

        `;
    }
}

function createAnnouncementItem(
    announcement
) {

    const title =
        escapeAnnouncementText(
            announcement.title ||
            "Announcement"
        );


    const content =
        escapeAnnouncementText(
            announcement.content ||
            ""
        );


    const committeeName =
        escapeAnnouncementText(
            announcement.committeeName ||
            "Global Announcement"
        );


    const createdBy =
        escapeAnnouncementText(
            announcement.createdByName ||
            announcement.createdBy ||
            "Administration"
        );


    const publishedAt =
        announcement.publishedAt ||
        announcement.createdAt;


    return `

        <div class="activity-item announcement-item">

            <div class="activity-icon">

                <i class="fa-solid fa-bullhorn"></i>

            </div>


            <div class="announcement-content">

                <strong>
                    ${title}
                </strong>


                <p>
                    ${content}
                </p>


                <small>

                    <i class="fa-solid fa-building"></i>

                    ${committeeName}

                    &nbsp;•&nbsp;

                    ${createdBy}

                    &nbsp;•&nbsp;

                    ${formatAnnouncementDate(
                        publishedAt
                    )}

                </small>

            </div>

        </div>

    `;
}

function escapeAnnouncementText(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;
}
function formatAnnouncementDate(
    date
) {

    if (!date) {
        return "";
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "";
    }


    return parsedDate.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}
function populateDashboard(data) {

    // User
    setText("userName", data.user?.fullName || data.user?.name || "Delegate");
    setText("profileName", data.user?.fullName || data.user?.name || "Delegate");
    setText("profileEmail", data.user?.email || "-");

const active =
    data.registration?.workflowStatus === "ACTIVE";

setText(
    "committeeName",
    active
        ? data.committee?.name
        : "Not Registered"
);

setText(
    "characterName",
    active
        ? data.character?.name
        : "Not Assigned"
);


    setText(
        "awardCount",
        Array.isArray(data.awards)
            ? data.awards.length
            : "0"
    );
console.log("Dashboard:", data);
console.log("Registration:", data.registration);
    renderCommitteeCard(data);

}



function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}
function renderCommitteeCard(data) {

    const registrationStatus =
        data.registration?.workflowStatus ?? "PENDING";

    const active =
        registrationStatus === "ACTIVE";


    const container =
        document.getElementById("committeeCard");


    if (!container) {
        return;
    }


    /* =====================================================
       NO ACTIVE REGISTRATION
    ====================================================== */

    if (!active) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-building-columns"></i>

                <h3>
                    No Active Registration
                </h3>

                <p>
                    Registration Status:
                    <strong>
                        ${escapeHTML(registrationStatus)}
                    </strong>
                </p>

            </div>

        `;

        return;
    }


    /* =====================================================
       COMMITTEE DATA
    ====================================================== */

    const committeeName =
        escapeHTML(
            data.committee?.name ?? "-"
        );


    const characterName =
        escapeHTML(
            data.character?.name ?? "-"
        );


    const chairpersonName =
        escapeHTML(
            data.committee?.chairpersonName ?? "-"
        );


    const mode =
        String(
            data.committee?.mode ?? ""
        ).toUpperCase();


    const registeredOn =
        data.registration?.registeredAt
            ? new Date(
                data.registration.registeredAt
              ).toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
              )
            : "-";


    /* =====================================================
       ONLINE / OFFLINE DETAILS
    ====================================================== */

    let meetingHTML = "";


    if (mode === "ONLINE") {

        const meetingLink =
            data.committee?.meetingLink;


        meetingHTML = meetingLink
            ? `
                <div class="detail-row">

                    <span>
                        <i class="fa-solid fa-video"></i>
                        Meeting
                    </span>

                    <a
                        href="${escapeHTML(meetingLink)}"
                        target="_blank"
                        rel="noopener noreferrer">

                        Join Meeting

                        <i class="fa-solid fa-arrow-up-right-from-square"></i>

                    </a>

                </div>
            `
            : `
                <div class="detail-row">

                    <span>
                        <i class="fa-solid fa-video"></i>
                        Meeting
                    </span>

                    <strong>
                        Link not available
                    </strong>

                </div>
            `;

    } else {

        const venue =
            escapeHTML(
                data.committee?.venue ?? "-"
            );


        meetingHTML = `
            <div class="detail-row">

                <span>
                    <i class="fa-solid fa-location-dot"></i>
                    Venue
                </span>

                <strong>
                    ${venue}
                </strong>

            </div>
        `;
    }


    /* =====================================================
       RENDER
    ====================================================== */

    container.innerHTML = `

        <div class="committee-details">

            <div class="detail-row">

                <span>
                    <i class="fa-solid fa-building-columns"></i>
                    Committee
                </span>

                <strong>
                    ${committeeName}
                </strong>

            </div>


            <div class="detail-row">

                <span>
                    <i class="fa-solid fa-user-tie"></i>
                    Character
                </span>

                <strong>
                    ${characterName}
                </strong>

            </div>


            <div class="detail-row">

                <span>
                    <i class="fa-solid fa-user-shield"></i>
                    Chairperson
                </span>

                <strong>
                    ${chairpersonName}
                </strong>

            </div>


            <div class="detail-row">

                <span>
                    <i class="fa-solid fa-circle-info"></i>
                    Registration
                </span>

                <strong>

                    <span
                        class="status-badge ${registrationStatus.toLowerCase()}">

                        ${escapeHTML(registrationStatus)}

                    </span>

                </strong>

            </div>


            <div class="detail-row">

                <span>
                    <i class="fa-solid fa-globe"></i>
                    Mode
                </span>

                <strong>
                    ${escapeHTML(mode || "-")}
                </strong>

            </div>


            ${meetingHTML}


            <div class="detail-row">

                <span>
                    <i class="fa-solid fa-calendar-plus"></i>
                    Registered On
                </span>

                <strong>
                    ${registeredOn}
                </strong>

            </div>

        </div>

    `;
}
/* ==========================================================
   UTILITIES
========================================================== */

function setText(id,value){

    const element =

        document.getElementById(id);

    if(element){

        element.textContent = value;

    }

}
function setHTML(id, html) {

    const element = document.getElementById(id);

    if (element) {
        element.innerHTML = html;
    }

}

function getInitials(name){

    if(!name) return "NA";

    return name

        .split(" ")

        .map(word=>word[0])

        .join("")

        .substring(0,2)

        .toUpperCase();

}



async function loadCertificate(){

    try{

        const certificate=

            await apiGet(

                "/certificates/user/" + userId

            );

        setText(

            "certificateStatus",

            certificate.status

        );

    }

    catch(e){

        console.error(e);

    }
    

}
async function loadCertificateEligibility() {

    const element =
        document.getElementById(
            "certificateStatus"
        );

    if (!element) {
        return;
    }


    try {

        element.textContent =
            "Checking...";


        const eligible =
            await apiRequest(
                "/certificates/eligibility"
            );


        if (eligible === true) {

            element.textContent =
                "ELIGIBLE";

            element.classList.remove(
                "not-eligible",
                "checking"
            );

            element.classList.add(
                "eligible"
            );

            return;
        }


        element.textContent =
            "NOT ELIGIBLE";

        element.classList.remove(
            "eligible",
            "checking"
        );

        element.classList.add(
            "not-eligible"
        );

    } catch (error) {

        console.error(
            "Failed to load certificate eligibility:",
            error
        );


        element.textContent =
            "UNAVAILABLE";

        element.classList.remove(
            "eligible",
            "not-eligible"
        );

        element.classList.add(
            "checking"
        );
    }
}