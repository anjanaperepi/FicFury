/* ==========================================================
   FIC FURY — INDEX PAGE
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initHeroVideo();
    initFuryRegistration();
    loadFeaturedCommittees();

});

/* ==========================================================
   CONFIG
   ========================================================== */

const API_BASE_URL = "https://ficfury.onrender.com/api";

const GOOGLE_SHEET_URL =
    "https://script.google.com/macros/s/AKfycbyVnsL0xXdna2amPqM5dSQO8Iz8Qq30s_ZFGt0ZMPj0e_PBJzPtYSF61SJrwIUQnz4b/exec";

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
   CINEMATIC FURY VIDEO
   ========================================================== */

function initHeroVideo() {

    const video =
        document.getElementById("furyHowToVideo");

    const container =
        document.getElementById("furyVideoContainer");

    const playButton =
        document.getElementById("furyVideoPlay");

    const soundButton =
        document.getElementById("furyVideoSound");

    const progressBar =
        document.getElementById("furyVideoProgressBar");


    /*
     * Stop here if the video section isn't present.
     */

    if (!video || !container) {
        return;
    }


    /* ------------------------------------------------------
       REDUCED MOTION
    ------------------------------------------------------ */

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    /* ------------------------------------------------------
       VIDEO VISIBILITY
       
       The video automatically plays when the visitor
       reaches the section and pauses when they leave it.
    ------------------------------------------------------ */

    const videoObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        /*
                         * Trigger the cinematic entrance.
                         */

                        container.classList.add(
                            "is-visible"
                        );


                        /*
                         * Don't autoplay for users who
                         * prefer reduced motion.
                         */

                        if (!prefersReducedMotion) {

                            video.play()
                                .then(() => {

                                    container.classList.add(
                                        "is-playing"
                                    );

                                })
                                .catch(error => {

                                    /*
                                     * Autoplay may be blocked
                                     * by the browser.
                                     *
                                     * The WATCH button remains
                                     * available.
                                     */

                                    console.log(
                                        "Video autoplay waiting for user interaction."
                                    );

                                });

                        }

                    } else {

                        /*
                         * Visitor has left the video.
                         *
                         * Pause it instead of continuing
                         * to consume resources.
                         */

                        video.pause();

                        container.classList.remove(
                            "is-playing"
                        );

                    }

                });

            },
            {
                threshold: 0.45
            }
        );


    videoObserver.observe(container);


    /* ------------------------------------------------------
       CENTER WATCH BUTTON
    ------------------------------------------------------ */

    if (playButton) {

        playButton.addEventListener(
            "click",
            async event => {

                event.preventDefault();
                event.stopPropagation();

                try {

                    if (video.paused) {

                        await video.play();

                        container.classList.add(
                            "is-playing"
                        );

                    } else {

                        video.pause();

                        container.classList.remove(
                            "is-playing"
                        );

                    }

                } catch (error) {

                    console.error(
                        "Unable to play FIC FURY video:",
                        error
                    );

                }

            }
        );

    }


    /* ------------------------------------------------------
       VIDEO CLICK
    ------------------------------------------------------ */

    video.addEventListener(
        "click",
        async () => {

            try {

                if (video.paused) {

                    await video.play();

                } else {

                    video.pause();

                }

            } catch (error) {

                console.error(
                    "Unable to toggle FIC FURY video:",
                    error
                );

            }

        }
    );


    /* ------------------------------------------------------
       VIDEO PLAY EVENT
    ------------------------------------------------------ */

    video.addEventListener(
        "play",
        () => {

            container.classList.add(
                "is-playing"
            );

        }
    );


    /* ------------------------------------------------------
       VIDEO PAUSE EVENT
    ------------------------------------------------------ */

    video.addEventListener(
        "pause",
        () => {

            container.classList.remove(
                "is-playing"
            );

        }
    );


    /* ------------------------------------------------------
       VIDEO ENDED
    ------------------------------------------------------ */

    video.addEventListener(
        "ended",
        () => {

            container.classList.remove(
                "is-playing"
            );

            /*
             * Keep the progress bar at 100%.
             */

            if (progressBar) {

                progressBar.style.width =
                    "100%";

            }

        }
    );


    /* ------------------------------------------------------
       SOUND TOGGLE
       
       IMPORTANT:
       This click is a direct user interaction,
       allowing us to safely enable audio.
    ------------------------------------------------------ */

    if (soundButton) {

        soundButton.addEventListener(
            "click",
            async event => {

                event.preventDefault();
                event.stopPropagation();


                try {

                    /*
                     * Currently muted → enable sound.
                     */

                    if (video.muted) {

                        video.muted = false;


                        /*
                         * If autoplay has paused the video,
                         * resume it after the user explicitly
                         * requested sound.
                         */

                        if (video.paused) {

                            await video.play();

                        }


                        soundButton.textContent =
                            "🔊";


                        soundButton.setAttribute(
                            "aria-label",
                            "Mute video"
                        );


                    } else {

                        /*
                         * Currently playing with sound →
                         * mute it.
                         */

                        video.muted = true;


                        soundButton.textContent =
                            "🔇";


                        soundButton.setAttribute(
                            "aria-label",
                            "Turn sound on"
                        );

                    }

                } catch (error) {

                    console.error(
                        "Unable to change video audio:",
                        error
                    );


                    /*
                     * Safest fallback.
                     */

                    video.muted = true;


                    soundButton.textContent =
                        "🔇";


                    soundButton.setAttribute(
                        "aria-label",
                        "Turn sound on"
                    );

                }

            }
        );

    }


    /* ------------------------------------------------------
       PROGRESS BAR
    ------------------------------------------------------ */

    video.addEventListener(
        "timeupdate",
        () => {

            if (
                !video.duration ||
                !progressBar
            ) {
                return;
            }


            const percentage =
                (
                    video.currentTime /
                    video.duration
                ) * 100;


            progressBar.style.width =
                `${percentage}%`;

        }
    );


    /* ------------------------------------------------------
       KEYBOARD ACCESSIBILITY
    ------------------------------------------------------ */

    video.addEventListener(
        "keydown",
        async event => {

            if (
                event.key === " " ||
                event.key === "Enter"
            ) {

                event.preventDefault();


                try {

                    if (video.paused) {

                        await video.play();

                    } else {

                        video.pause();

                    }

                } catch (error) {

                    console.error(
                        "Unable to toggle video:",
                        error
                    );

                }

            }

        }
    );


    /* ------------------------------------------------------
       ACCESSIBILITY
    ------------------------------------------------------ */

    video.setAttribute(
        "tabindex",
        "0"
    );

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

        element.style.transform +=
            " translateY(25px)";

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


    if (
        !Array.isArray(committees) ||
        committees.length === 0
    ) {

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

    article.className =
        "committee-card";


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
                ${date
                    ? escapeHtml(date)
                    : "ACTIVE"
                }
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
        `rotate(${
            rotations[index % rotations.length]
        })`;


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


    return `${text
        .substring(0, maxLength)
        .trim()}...`;

}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
/* ==========================================================
   FIC FURY — REGISTRATION / INTEREST MODAL
   ========================================================== */

function initFuryRegistration() {

    const modal =
        document.getElementById("furyRegistrationModal");

    const modalCard =
        document.querySelector(".fury-modal-card");

    const closeButton =
        document.getElementById("furyModalClose");

    const form =
        document.getElementById("furyRegistrationForm");

    const submitButton =
        document.getElementById("furySubmitButton");

    const formStatus =
        document.getElementById("furyFormStatus");

    const success =
        document.getElementById("furySuccess");


    /*
     * Make sure the registration elements exist.
     */

    if (
        !modal ||
        !modalCard ||
        !form
    ) {

        console.warn(
            "FIC FURY registration form elements not found."
        );

        return;

    }


    /* ======================================================
       OPEN MODAL
    ====================================================== */

    function openModal(event) {

        if (event) {
            event.preventDefault();
        }


        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        /*
         * Prevent the landing page from scrolling
         * while the modal is open.
         */

        document.body.classList.add(
            "fury-modal-open"
        );


        /*
         * Reset status messages.
         */

        if (formStatus) {

            formStatus.textContent = "";

            formStatus.className =
                "fury-form-status";

        }


        /*
         * Focus the first field.
         */

        setTimeout(() => {

            const nameInput =
                document.getElementById("furyName");

            if (nameInput) {
                nameInput.focus();
            }

        }, 250);

    }


    /* ======================================================
       CLOSE MODAL
    ====================================================== */

    function closeModal() {

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "fury-modal-open"
        );

    }


    /* ======================================================
       JOIN / REGISTER BUTTONS
    ====================================================== */

    const triggers =
        document.querySelectorAll(
            ".fury-register-trigger"
        );


    triggers.forEach(trigger => {

        trigger.addEventListener(
            "click",
            openModal
        );

    });


    /* ======================================================
       CLOSE BUTTON
    ====================================================== */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    /* ======================================================
       BACKDROP CLOSE
    ====================================================== */

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target.matches(
                    "[data-fury-close]"
                )
            ) {

                closeModal();

            }

        }
    );


    /* ======================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeModal();

            }

        }
    );


    /* ======================================================
       FIELD ERROR HELPERS
    ====================================================== */

    function clearErrors() {

        const errors =
            form.querySelectorAll(
                ".fury-field-error"
            );


        errors.forEach(error => {

            error.textContent = "";

        });


        const invalidFields =
            form.querySelectorAll(
                ".fury-field.invalid"
            );


        invalidFields.forEach(field => {

            field.classList.remove(
                "invalid"
            );

        });

    }


    function setError(
        fieldName,
        message
    ) {

        const error =
            form.querySelector(
                `[data-error-for="${fieldName}"]`
            );


        if (error) {

            error.textContent =
                message;

        }


        const field =
            form.querySelector(
                `[name="${fieldName}"]`
            );


        if (field) {

            const wrapper =
                field.closest(".fury-field");

            if (wrapper) {

                wrapper.classList.add(
                    "invalid"
                );

            }

        }

    }


    /* ======================================================
       VALIDATION
    ====================================================== */

    function validateForm(data) {

        clearErrors();

        let valid = true;


        /* -----------------------------------------------
           NAME
        ----------------------------------------------- */

        if (
            !data.name ||
            data.name.trim().length < 2
        ) {

            setError(
                "name",
                "Please enter your full name."
            );

            valid = false;

        }


        /* -----------------------------------------------
           EMAIL
        ----------------------------------------------- */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !data.email ||
            !emailPattern.test(
                data.email.trim()
            )
        ) {

            setError(
                "email",
                "Please enter a valid email address."
            );

            valid = false;

        }


        /* -----------------------------------------------
           PHONE
        ----------------------------------------------- */

        if (data.phone) {

            const phoneDigits =
                data.phone.replace(
                    /\D/g,
                    ""
                );


            if (
                phoneDigits.length < 10
            ) {

                setError(
                    "phone",
                    "Please enter a valid phone number."
                );

                valid = false;

            }

        }


        /* -----------------------------------------------
           INSTITUTION
        ----------------------------------------------- */

        if (
            !data.institution ||
            data.institution.trim().length < 2
        ) {

            setError(
                "institution",
                "Please enter your institution."
            );

            valid = false;

        }


        /* -----------------------------------------------
           EXPERIENCE
        ----------------------------------------------- */

        if (!data.experience) {

            setError(
                "experience",
                "Please select your experience."
            );

            valid = false;

        }


        /* -----------------------------------------------
           UNIVERSE
        ----------------------------------------------- */

        if (!data.universe) {

            setError(
                "universe",
                "Please select a universe."
            );

            valid = false;

        }


        /* -----------------------------------------------
           CONSENT
        ----------------------------------------------- */

        if (!data.consent) {

            setError(
                "consent",
                "Please agree to be contacted."
            );

            valid = false;

        }


        return valid;

    }


    /* ======================================================
       FORM SUBMISSION
    ====================================================== */

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearErrors();


            /* -------------------------------------------
               COLLECT DATA
            ------------------------------------------- */

            const formData =
                new FormData(form);


            const data = {

                name:
                    formData
                        .get("name")
                        ?.trim(),

                email:
                    formData
                        .get("email")
                        ?.trim(),

                phone:
                    formData
                        .get("phone")
                        ?.trim(),

                institution:
                    formData
                        .get("institution")
                        ?.trim(),

                experience:
                    formData
                        .get("experience"),

                universe:
                    formData
                        .get("universe"),

                message:
                    formData
                        .get("message")
                        ?.trim(),

                consent:
                    formData
                        .get("consent") === "on"

            };


            /* -------------------------------------------
               VALIDATE
            ------------------------------------------- */

            if (!validateForm(data)) {

                return;

            }


            /* -------------------------------------------
               BUTTON LOADING STATE
            ------------------------------------------- */

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.classList.add(
                    "loading"
                );

                submitButton.innerHTML = `
                    SENDING...
                    <span>↗</span>
                `;

            }


            if (formStatus) {

                formStatus.textContent =
                    "Preparing your transmission...";

                formStatus.className =
                    "fury-form-status";

            }


/* -------------------------------------------
   SEND TO GOOGLE SHEETS
------------------------------------------- */

try {

    const payload = new URLSearchParams();

    payload.append(
        "name",
        data.name || ""
    );

    payload.append(
        "email",
        data.email || ""
    );

    payload.append(
        "phone",
        data.phone || ""
    );

    payload.append(
        "institution",
        data.institution || ""
    );

    payload.append(
        "experience",
        data.experience || ""
    );

    payload.append(
        "universe",
        data.universe || ""
    );

    payload.append(
        "message",
        data.message || ""
    );

    payload.append(
        "consent",
        data.consent ? "Yes" : "No"
    );


    /*
     * Google Apps Script receives these
     * as e.parameter values.
     */

    await fetch(
        GOOGLE_SHEET_URL,
        {
            method: "POST",

            body: payload,

            mode: "no-cors"
        }
    );


    /*
     * no-cors means the browser cannot read
     * Google's response, but the POST is sent.
     *
     * Therefore we treat completion of fetch()
     * as successful submission.
     */

    console.log(
        "FIC FURY response submitted."
    );


    /* -------------------------------------------
       SHOW SUCCESS
    ------------------------------------------- */

    form.hidden = true;

    if (success) {

        success.hidden = false;

    }


    if (formStatus) {

        formStatus.textContent = "";

    }


} catch (error) {

    console.error(
        "FIC FURY Google Sheets submission failed:",
        error
    );


    if (formStatus) {

        formStatus.textContent =
            "Transmission failed. Please try again.";

        formStatus.className =
            "fury-form-status error";

    }


    /*
     * Re-enable button.
     */

    if (submitButton) {

        submitButton.disabled = false;

        submitButton.classList.remove(
            "loading"
        );

        submitButton.innerHTML = `
            ENTER THE FURY
            <span>→</span>
        `;

    }

}


 

        }
    );


    /* ======================================================
       SUCCESS → BACK TO LANDING PAGE
    ====================================================== */

    if (success) {

        success
            .querySelectorAll(
                "[data-fury-close]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        closeModal();

                        /*
                         * Reset the form so it is ready
                         * the next time the user opens it.
                         */

                        setTimeout(() => {

                            form.reset();

                            form.hidden = false;

                            success.hidden = true;

                            clearErrors();

                        }, 300);

                    }
                );

            });

    }


    /* ======================================================
       RESET FORM WHEN MODAL CLOSES
    ====================================================== */

    closeButton?.addEventListener(
        "click",
        () => {

            setTimeout(() => {

                form.reset();

                form.hidden = false;

                if (success) {
                    success.hidden = true;
                }

                clearErrors();

            }, 300);

        }
    );

}