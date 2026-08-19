/* ==========================================================
   MENU CONFIGURATION
========================================================== */
function getCurrentUser() {

    const USER_KEY = "currentUser"; // Replace with your actual key

    return JSON.parse(localStorage.getItem(USER_KEY));

}
const SIDEBAR_MENU = {

    ADMIN: {

        dashboard: {

            title: "Dashboard",

            items: [

                {
                    id: "dashboard",
                    title: "Dashboard",
                    icon: "house",
                    page: "admin-dashboard.html",
                    enabled: true
                }

            ]

        },

        management: {

            title: "Management",

            items: [

                {
                    id: "committees",
                    title: "Committees",
                    icon: "building-columns",
                    page: "committee-management.html",
                    enabled: true
                },

                {
                    id: "characters",
                    title: "Characters",
                    icon: "masks-theater",
                    page: "character-management.html",
                    enabled: true
                },

                {
                    id: "delegates",
                    title: "Delegates",
                    icon: "users",
                    page: "admin-delegate-management.html",
                    enabled: true
                },

                {
                    id: "debate",
                    title: "Debate Room",
                    icon: "comments",
                    page: "admin-session-management.html",
                    enabled: true
                },


                {
                    id: "resources",
                    title: "Resources",
                    icon: "folder-open",
                    page: "admin-resources.html",
                    enabled: true
                },

                
            {
                id: "certificates",
                title: "Certificates",
                icon: "certificate",
                page: "certificate-generator.html",
                enabled: true
            }



            ]

        },

        operations: {

            title: "Operations",

            items: [

               




                {
                    id: "announcements",
                    title: "Announcements",
                    icon: "bullhorn",
                    page: "announcement-management.html",
                    enabled: true
                }

            ]

        },

        analytics: {

            title: "Analytics",

            items: [

                {
                    id: "analytics",
                    title: "Dashboard Analytics",
                    icon: "chart-line",
                    page: "analytics.html",
                    enabled: false
                },

                {
                    id: "reports",
                    title: "Reports",
                    icon: "chart-pie",
                    page: "reports.html",
                    enabled: false
                }

            ]

        },

        system: {

            title: "System",

            items: [

                {
                    id: "users",
                    title: "User Management",
                    icon: "user-gear",
                    page: "admin-user-management.html",
                    enabled: true
                },

                {
                    id: "settings",
                    title: "Settings",
                    icon: "gear",
                    page: "settings.html",
                    enabled: false
                }

            ]

        }

    },

     CHAIR: {

        dashboard: {

            title: "Dashboard",

            items: [

                {
                    id: "dashboard",
                    title: "Dashboard",
                    icon: "house",
                    page: "chair-dashboard.html",
                    enabled: true
                }

            ]

        },

        committee: {

            title: "Committee",

            items: [

                {
                    id: "members",
                    title: "Delegates",
                    icon: "users",
                    page: "chair-delegate-management.html",
                    enabled: true
                },

                            {
                id: "debate",
                title: "Debate Room",
                icon: "comments",
                page: "debate-room.html",
                enabled: true
            },



                {
                    id: "announcements",
                    title: "Announcements",
                    icon: "bullhorn",
                    page: "announcement-management.html",
                    enabled: true
                },

                {
                    id: "resources",
                    title: "Resources",
                    icon: "book",
                    page: "chair-resources.html",
                    enabled: true
                },

                {
                    id: "awards",
                    title: "Awards",
                    icon: "trophy",
                    page: "award-management.html",
                    enabled: true
                }

            ]

        },

            account: {

        title: "Account",

        items: [

            {
                id: "profile",
                title: "Profile",
                icon: "user",
                page: "chair-profile.html",
                enabled: true
            }

        ]

    }

    },
    DELEGATE: {

    dashboard: {

        title: "Dashboard",

        items: [

            {
                id: "dashboard",
                title: "Dashboard",
                icon: "house",
                page: "dashboard.html",
                enabled: true
            }

        ]

    },

    explore: {

        title: "Explore Committees",

        items: [

            {
                id: "explore",
                title: "Explore Committees",
                icon: "building-columns",
                page: "committee-explorer.html",
                enabled: true
            }

        ]

    },

    conference: {

        title: "Conference",

        items: [



            {
                id: "debate",
                title: "Debate Room",
                icon: "comments",
                page: "debate-room.html",
                enabled: true
            },



            {
                id: "resources",
                title: "Resources",
                icon: "folder-open",
                page: "resources.html",
                enabled: true
            }

        ]

    },


    achievements: {

        title: "Achievements",

        items: [

            {
                id: "awards",
                title: "Awards",
                icon: "trophy",
                page: "awards-certificates.html",
                enabled: true
            }

        ]

    },

    account: {

        title: "Account",

        items: [

            {
                id: "profile",
                title: "Profile",
                icon: "user",
                page: "profile.html",
                enabled: true
            }

        ]

    }

},

};
    


/* ==========================================================
   SIDEBAR
========================================================== */

const Sidebar = {

    init: function () {

        Sidebar.loadUser();

        Sidebar.renderMenu();

        Sidebar.highlightActivePage();

        Sidebar.attachEvents();

        Sidebar.updateDebateRoomState();

    }

};
/* ==========================================================
   LOAD CURRENT USER INTO SIDEBAR
   ========================================================== */

Sidebar.loadUser = function () {

    const user = JSON.parse(
        localStorage.getItem(CONFIG.USER_KEY)
    );

    if (!user) {

        console.warn(
            "No logged-in user found."
        );

        return;
    }

    const nameElement =
        document.getElementById("sidebarUserName");

    const roleElement =
        document.getElementById("sidebarUserRole");

    const avatarElement =
        document.getElementById("sidebarAvatar");

    if (!nameElement || !roleElement || !avatarElement) {
        return;
    }

    const displayName =
        user.fullName ||
        user.name ||
        "Delegate";

    nameElement.textContent =
        displayName;

    roleElement.textContent =
        user.role;

    avatarElement.textContent =
        displayName
            .split(" ")
            .map(word => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

};

/* ==========================================================
   FIC FURY — EDITORIAL SIDEBAR SECTION LABELS
   ========================================================== */

const FIC_FURY_SECTION_LABELS = {

    ADMIN: {
        dashboard: "YOUR UNIVERSE",
        management: "EXPLORE",
        operations: "THE ACTION",
        analytics: "INSIGHTS",
        system: "THE ARCHIVE"
    },

    CHAIR: {
        dashboard: "YOUR UNIVERSE",
        committee: "THE ACTION"
    },

    DELEGATE: {
        dashboard: "YOUR UNIVERSE",
        explore: "EXPLORE",
        conference: "THE ACTION",
        achievements: "THE ARCHIVE",
        account: "ACCOUNT"
    }

};

function createSidebarMenuItem(item) {

    const link = document.createElement("a");

    link.className = "menu-item";

    link.dataset.page = item.page;

    link.dataset.tooltip = item.title;

    if (item.enabled) {

        link.href = item.page;

    } else {

        link.href = "#";

        link.classList.add("disabled");

    }

    link.innerHTML = `
        <i class="fa-solid fa-${item.icon}"></i>
        <span>${item.title}</span>
    `;

    return link;
};

Sidebar.renderMenu = function () {

    const user = JSON.parse(
        localStorage.getItem(CONFIG.USER_KEY)
    );

    if (!user) return;

    const nav = document.getElementById("sidebarNav");

    if (!nav) {
        console.error(
            "Sidebar navigation container not found."
        );
        return;
    }

    nav.innerHTML = "";

    const role = user.role.toUpperCase();

    const sections = SIDEBAR_MENU[role];

    if (!sections) {

        console.error(
            "No sidebar menu configured for role:",
            role
        );

        return;
    }

    Object.entries(sections).forEach(
        ([sectionKey, section]) => {

            const title = document.createElement("h5");

            title.className = "menu-section";

            title.textContent =
                FIC_FURY_SECTION_LABELS[role]?.[sectionKey]
                || section.title;

            nav.appendChild(title);

section.items.forEach(item => {

    nav.appendChild(
        createSidebarMenuItem(item)
    );

});
        }
    );

};

Sidebar.updateDebateRoomState = async function () {

    const user =
        JSON.parse(
            localStorage.getItem(
                CONFIG.USER_KEY
            )
        );

    if (!user) {
        return;
    }


    const debateLink =
        document.querySelector(
            '.menu-item[data-page="debate-room.html"]'
        );

    if (!debateLink) {
        return;
    }


    let activeSession = false;


    try {

        if (
            user.role.toUpperCase() ===
            "DELEGATE"
        ) {

            const dashboard =
                await apiRequest(
                    "/dashboard/delegate"
                );

            const committeeId =
                dashboard.committee?.id;

            if (
                dashboard.registration?.workflowStatus ===
                    "ACTIVE" &&
                committeeId
            ) {

                const session =
                    await apiRequest(
                        `/debate/sessions/active/${committeeId}`
                    );

                activeSession =
                    !!session?.id &&
                    String(session.status).toUpperCase() ===
                        "ACTIVE";
            }

        } else if (
            user.role.toUpperCase() ===
            "CHAIR"
        ) {

            const sessions =
                await apiRequest(
                    `/debate/sessions/chair/${user.id}`
                );

            const sessionList =
                Array.isArray(sessions)
                    ? sessions
                    : [sessions];


            activeSession =
                sessionList.some(
                    session =>
                        String(
                            session?.status
                        ).toUpperCase() ===
                        "ACTIVE"
                );

        }

    } catch (error) {

        console.log(
            "No active debate session."
        );

    }


    debateLink.classList.toggle(
        "debate-room-disabled",
        !activeSession
    );

    debateLink.dataset.sessionActive =
        activeSession
            ? "true"
            : "false";

};

Sidebar.highlightActivePage = function(){

    const current =

        window.location.pathname

            .split("/")

            .pop();

    document

        .querySelectorAll(".menu-item")

        .forEach(item=>{

            if(item.dataset.page===current){

                item.classList.add("active");

            }

        });

};

Sidebar.toggleMobile = function(){

    document.body.classList.toggle(

        "sidebar-mobile-open"

    );

    document

        .getElementById("sidebarBackdrop")

        .classList.toggle("active");

};
function initializeSidebar() {

    Sidebar.init();

}
Sidebar.attachEvents = function () {
    const backdrop =
    document.getElementById("sidebarBackdrop");

if (backdrop) {

    backdrop.addEventListener("click", () => {

        document.body.classList.remove(
            "sidebar-mobile-open"
        );

        backdrop.classList.remove("active");

    });

}
    const toggle =
        document.getElementById("sidebarToggle");

    if (!toggle) {
        return;
    }

    toggle.addEventListener("click", () => {

        const isMobile =
            window.innerWidth <= 992;

        if (isMobile) {

            // Mobile/tablet drawer
            Sidebar.toggleMobile();

        } else {

            // Desktop collapsed sidebar
            document.body.classList.toggle(
                "sidebar-collapsed"
            );

        }

    });

    document
    .querySelectorAll(
        '.menu-item[data-page="debate-room.html"]'
    )
    .forEach(link => {

        link.addEventListener(
            "click",
            function (event) {

                if (
                    link.dataset.sessionActive !==
                    "true"
                ) {

                    event.preventDefault();

                    if (
                        window.FuryToast
                    ) {

                        FuryToast.warning(
                            "No active debate session yet. Please wait for the Chair to start the session."
                        );

                    }

                }

            }
        );

    });

};

