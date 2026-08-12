document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!Auth.isLoggedIn()) {

            window.location.href =
                "../login.html";

            return;

        }

        await loadKPIs();

        await loadPopularCommittees();

        await loadTopDelegates();

        await loadPlatformActivity();

        await loadChairPerformance();

    }
);


// ==========================
// KPI DASHBOARD
// ==========================

async function loadKPIs() {

    try {

        const data =
            await apiRequest(
                "/analytics/kpis"
            );

        setText(
            "totalUsers",
            data.totalUsers
        );

        setText(
            "totalRegistrations",
            data.totalRegistrations
        );

        setText(
            "attendanceRate",
            `${data.attendanceRate}%`
        );

        setText(
            "totalResolutions",
            data.totalResolutions
        );

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// POPULAR COMMITTEES
// ==========================

async function loadPopularCommittees() {

    try {

        const committees =
            await apiRequest(
                "/analytics/popular-committees"
            );

        const container =
            document.getElementById(
                "committeeRankingList"
            );

        if(!container) return;

        container.innerHTML = "";

        committees.forEach(
            (committee,index) => {

                const medals =
                    ["🥇","🥈","🥉"];

                container.innerHTML += `

                    <div class="rank-item">

                        ${
                            medals[index]
                            || "🏅"
                        }

                        ${committee.name}

                        —
                        ${committee.registrations}

                        Registrations

                    </div>

                `;

            }
        );

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// TOP DELEGATES
// ==========================

async function loadTopDelegates() {

    try {

        const delegates =
            await apiRequest(
                "/analytics/top-delegates"
            );

        const tbody =
            document.getElementById(
                "delegateTableBody"
            );

        if(!tbody) return;

        tbody.innerHTML = "";

        delegates.forEach(delegate => {

            tbody.innerHTML += `

                <tr>

                    <td>
                        ${delegate.name}
                    </td>

                    <td>
                        ${delegate.committee}
                    </td>

                    <td>
                        ${delegate.points}
                    </td>

                    <td>
                        ${delegate.award}
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
// PLATFORM ACTIVITY
// ==========================

async function loadPlatformActivity() {

    try {

        const activity =
            await apiRequest(
                "/analytics/activity"
            );

        setText(
            "activityResolutions",
            activity.resolutions
        );

        setText(
            "activityMessages",
            activity.messages
        );

        setText(
            "activityCrises",
            activity.crises
        );

        setText(
            "activityDownloads",
            activity.downloads
        );

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// CHAIR PERFORMANCE
// ==========================

async function loadChairPerformance() {

    try {

        const chairs =
            await apiRequest(
                "/analytics/chairs"
            );

        const tbody =
            document.getElementById(
                "chairTableBody"
            );

        if(!tbody) return;

        tbody.innerHTML = "";

        chairs.forEach(chair => {

            tbody.innerHTML += `

                <tr>

                    <td>
                        ${chair.name}
                    </td>

                    <td>
                        ${chair.committee}
                    </td>

                    <td>
                        ${chair.attendance}%
                    </td>

                    <td>
                        ${chair.rating}/5
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
// EXPORT REPORT
// ==========================

function exportReport() {

    window.open(
        `${CONFIG.API_BASE_URL}/analytics/export`,
        "_blank"
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
            value || 0;

    }

}