/* ==========================================================
   FIC FURY — INDEX PAGE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    loadFeaturedCommittees();

});


/* ==========================================================
   CONFIG
========================================================== */

const API_BASE_URL = "https://ficfury.onrender.com/api";


/* ==========================================================
   NAVBAR
========================================================== */

function initNavbar() {

    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    const handleScroll = () => {

        if (window.scrollY > 30) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

}


/* ==========================================================
   MOBILE MENU
========================================================== */

function initMobileMenu() {

    const button = document.getElementById("mobileMenuButton");
    const menu = document.getElementById("mobileNav");

    if (!button || !menu) return;

    button.addEventListener("click", () => {

        const active = menu.classList.toggle("active");

        button.setAttribute(
            "aria-expanded",
            String(active)
        );

    });


    menu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("active");

            button.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


/* ==========================================================
   SCROLL ANIMATIONS
========================================================== */

function initScrollAnimations() {

    const elements = document.querySelectorAll(
        ".universe-card, .step, .experience-card, .committee-card"
    );

    if (!("IntersectionObserver" in window)) {
        return;
    }

    elements.forEach(element => {

        element.style.opacity = "0";
        element.style.transform += " translateY(25px)";

    });


    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.style.transition =
                    "opacity 0.5s ease, transform 0.5s ease";

                entry.target.style.opacity = "1";
                entry.target.style.transform =
                    entry.target.style.transform
                        .replace("translateY(25px)", "");

                observer.unobserve(entry.target);

            });

        },
        {
            threshold: 0.12
        }
    );


    elements.forEach(element => {
        observer.observe(element);
    });

}


/* ==========================================================
   FEATURED COMMITTEES
========================================================== */

async function loadFeaturedCommittees() {

    const grid = document.getElementById("committeeGrid");

    if (!grid) return;

    try {

        const response = await fetch(
            `${API_BASE_URL}/committees`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load committees: ${response.status}`
            );
        }

        const committees = await response.json();

        renderCommittees(grid, committees);

    } catch (error) {

        console.error(
            "Failed to load featured committees:",
            error
        );

        renderFallbackCommittees(grid);

    }

}


/* ==========================================================
   RENDER COMMITTEES
========================================================== */

function renderCommittees(grid, committees) {

    grid.innerHTML = "";

    if (!Array.isArray(committees) || committees.length === 0) {

        renderFallbackCommittees(grid);

        return;
    }


    /*
        Show up to six committees on the landing page.
        The complete list remains available inside the app.
    */

    committees
        .slice(0, 6)
        .forEach((committee, index) => {

            const card =
                createCommitteeCard(
                    committee,
                    index
                );

            grid.appendChild(card);

        });

}


/* ==========================================================
   CREATE COMMITTEE CARD
========================================================== */

function createCommitteeCard(committee, index) {

    const article =
        document.createElement("article");

    article.className = "committee-card";


    const category =
        committee.category ||
        committee.type ||
        "FICTION";


    const name =
        committee.name ||
        "Untitled Committee";


    const description =
        committee.description ||
        "Enter the committee and shape the story.";


    const date =
        committee.date ||
        committee.startDate ||
        "";


    article.innerHTML = `
        <div>

            <span class="committee-category">
                ${escapeHtml(category)}
            </span>

            <h3>
                ${escapeHtml(name)}
            </h3>

            <p style="
                margin-top: 12px;
                font-size: 12px;
                line-height: 1.6;
                color: #666;
            ">
                ${escapeHtml(
                    truncate(description, 100)
                )}
            </p>

        </div>

        <div class="committee-card-footer">

            <span>
                ${date ? escapeHtml(date) : "ACTIVE"}
            </span>

            <span class="committee-enter">
                ENTER →
            </span>

        </div>
    `;


    /*
        Slight comic-book rotation.
    */

    const rotations = [
        "-1deg",
        "1deg",
        "-0.5deg",
        "1deg",
        "-1deg",
        "0.5deg"
    ];

    article.style.transform =
        `rotate(${rotations[index % rotations.length]})`;


    return article;

}


/* ==========================================================
   FALLBACK
========================================================== */

function renderFallbackCommittees(grid) {

    grid.innerHTML = `
        <article class="committee-card">

            <div>

                <span class="committee-category">
                    FICTION
                </span>

                <h3>
                    THE FURY
                </h3>

                <p style="
                    margin-top: 12px;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #666;
                ">
                    Step into the debate and create your own
                    fictional battlefield.
                </p>

            </div>

            <div class="committee-card-footer">

                <span>
                    OPEN
                </span>

                <span class="committee-enter">
                    JOIN →
                </span>

            </div>

        </article>
    `;

}


/* ==========================================================
   HELPERS
========================================================== */

function truncate(text, maxLength) {

    if (!text) {
        return "";
    }

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.substring(0, maxLength).trim()}...`;

}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}