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
            id: "how-to",
            title: "How To",
            icon: "circle-question",
            page: "#",
            enabled: true
        },

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

if (item.id === "how-to") {

    link.classList.add("how-to-floating");

    link.addEventListener("click", (event) => {
        event.preventDefault();
        HowToModal.open();
    });
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

Sidebar.toggleMobile = function () {

    document.body.classList.toggle(
        "sidebar-mobile-open"
    );

    const backdrop =
        document.getElementById("sidebarBackdrop");

    if (backdrop) {

        backdrop.classList.toggle("active");

    }

};
function initializeSidebar() {

    Sidebar.init();

}
Sidebar.attachEvents = function () {

    /* =====================================================
       MOBILE SIDEBAR BUTTON
       ===================================================== */

    const mobileButton =
        document.getElementById("mobileSidebarButton");

    if (mobileButton) {

        mobileButton.addEventListener("click", () => {

            Sidebar.toggleMobile();

        });

    }


    /* =====================================================
       SIDEBAR BACKDROP
       ===================================================== */

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


    /* =====================================================
       ORIGINAL SIDEBAR TOGGLE
       ===================================================== */

    const toggle =
        document.getElementById("sidebarToggle");

    if (toggle) {

        toggle.addEventListener("click", () => {

            const isMobile =
                window.innerWidth <= 992;

            if (isMobile) {

                Sidebar.toggleMobile();

            } else {

                document.body.classList.toggle(
                    "sidebar-collapsed"
                );

            }

        });

    }

};
const HowToModal = {

open() {
    const modal = document.getElementById("howToModal");

    if (!modal) return;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    this.loadPageInstructions();

    const closeButton = document.getElementById("howToClose");
    const backdrop = modal.querySelector("[data-how-to-close]");

    closeButton.onclick = () => this.close();

    backdrop.onclick = () => this.close();
},
    close() {
        const modal = document.getElementById("howToModal");

        if (!modal) return;

        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
    },

    loadPageInstructions() {

        const title = document.getElementById("howToTitle");
        const intro = document.getElementById("howToIntro");
        const content = document.getElementById("howToContent");

        if (!title || !intro || !content) return;

        const page = window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

        const instructions = {

"dashboard.html": {
    title: "Your Dashboard",
    intro: "Your dashboard gives you an overview of your FIC FURY participation.",
    content: `
        <h3>Getting started</h3>

        <p>
            If you haven't registered for a committee yet,
            head to <strong>Explore Committees</strong> in the sidebar
            to find and register for an available committee.
        </p>

        <p>
            Once you're registered, your dashboard will show
            information relevant to your committee and participation.
        </p>

        <p>
            <strong>Tip:</strong>
            Check your dashboard regularly for important updates.
        </p>

        
    `
},
"committee-explorer.html": {
    title: "Explore Committees",
    intro: "Find a committee and register to participate in a FIC FURY debate.",
    content: `
        <h3>How to get started</h3>

        <ol>
            <li>
                Browse the available committees.
            </li>

            <li>
                Use the available filters to narrow down committees
                by <strong>category</strong> or <strong>mode</strong>.
            </li>

            <li>
                Open a committee to view its details before registering.
            </li>

            <li>
                Choose a committee that interests you and
                complete the registration process.
            </li>

            <li>
                Once registered, your assigned committee and character
                will appear on your dashboard.
            </li>
                        <li>
                Once approved, you can access the Resources and Debate Room for your committee.
            </li>
        </ol>

        <p>
            <strong>Already registered?</strong>
            Your assigned committee and character will appear
            on your dashboard once your registration is active.
        </p>
    `
},

"debate-room.html": {
    title: "Debate Room",
    intro: "Your main space for participating in an active FIC FURY debate.",
    content: `
        <h3>During the debate</h3>

        <ol>
            <li>
                Join the debate once your committee session is active.
            </li>

             <li>
You can request to speak by clicking the <strong>Request to Speak</strong> button.
            </li>
 <li>
Use Diplomacy Mode to send private messages to other delegates or the Chair.
            </li>
            <li>
                Keep an eye on the <strong>speaker queue</strong>
                to know when you are expected to speak.
            </li>

            <li>
                Follow the Chair's instructions and participate
                when you are called upon.
            </li>

            <li>
                Use the available debate controls to participate
                in the session.
            </li>
        </ol>

        <p>
            <strong>Tip:</strong>
            Keep the Debate Room open during your committee session
            so you don't miss updates or speaking opportunities.
        </p>
    `
},

"resources.html": {
    title: "Resources",
    intro: "Access and use resources provided for your FIC FURY committees.",
    content: `
        <h3>Using Resources</h3>

        <ol>
            <li>
                Browse the resources available to you.
            </li>

            <li>
                Open a resource to view its contents or access the
                provided material.
            </li>

            <li>
                Use these materials to research your committee,
                character, and debate topic.
            </li>
        </ol>

        <p>
            <strong>Tip:</strong>
            Check the Resources page regularly, as new materials
            may be added during the course of your committee.
        </p>
    `
},

"awards-certificates.html": {
    title: "Awards & Certificates",
    intro: "Track your achievements and access certificates earned through FIC FURY.",
    content: `
        <h3>Your Achievements</h3>

        <ol>
            <li>
                Check this page to view awards and achievements
                associated with your FIC FURY participation.
            </li>

            <li>
                Review your available certificates once you become
                eligible to receive them.
            </li>

            <li>
                Use the information here to keep track of your
                participation and accomplishments.
            </li>
        </ol>

        <p>
            <strong>Tip:</strong>
            Continue participating actively in your committees
            to build your FIC FURY achievements.
        </p>
    `
},

"profile.html": {
    title: "Your Profile",
    intro: "Manage your FIC FURY account information and view your participation details.",
    content: `
        <h3>Managing Your Profile</h3>

        <ol>
            <li>
                Review your personal and account information.
            </li>

            <li>
                Get promoted to Chair with the proposal of a committee and approval from the FIC FURY team.
            </li>

            <li>
                Check your profile details to make sure your
                information is accurate.
            </li>
        </ol>


    `
},
        };

        const pageInfo = instructions[page];

        if (pageInfo) {

            title.textContent = pageInfo.title;
            intro.textContent = pageInfo.intro;
            content.innerHTML = pageInfo.content;

        } else {

            title.textContent = "How To";
            intro.textContent = "Here's how to use this part of FIC FURY.";

            content.innerHTML = `
                <h3>Getting started</h3>
                <p>
                    Use the available controls and follow the instructions
                    provided on this page.
                </p>
            `;
        }
    }
};


document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        HowToModal.close();
    }
});

