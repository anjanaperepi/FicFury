/* =========================================================
   FIC FURY
   AWARDS & CERTIFICATES
   Delegate Page
========================================================= */

const AchievementsPage = {

    /* =====================================================
       INITIALIZATION
    ===================================================== */

async init() {

    console.log(
        "🏆 Awards & Certificates page initializing..."
    );

    try {

        const user =
            Auth.getCurrentUser();

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }

        await this.loadAwards(user);

        await this.loadCertificates();

        console.log(
            "✅ Awards & Certificates page initialized."
        );

    } catch (error) {

        console.error(
            "❌ Achievements page initialization failed:",
            error
        );

        this.showAwardsError();
    }
},


    /* =====================================================
       LOAD AWARDS
    ===================================================== */

    async loadAwards(user) {

        const container =
            document.getElementById(
                "awardsList"
            );


        if (!container) {

            console.warn(
                "#awardsList not found."
            );

            return;
        }


        try {

            /*
             * The delegate dashboard already receives
             * a user-specific awards collection.
             *
             * We reuse that endpoint instead of calling
             * the admin-wide /awards endpoint.
             */

            const dashboard =
                await apiRequest(
                    "/dashboard/delegate"
                );


            console.log(
                "🏆 Delegate dashboard data:",
                dashboard
            );


            const awards =
                Array.isArray(
                    dashboard?.awards
                )
                    ? dashboard.awards
                    : [];


            console.log(
                "🏆 Delegate awards:",
                awards
            );


            this.updateAwardCount(
                awards.length
            );


            this.renderAwards(
                awards
            );


        } catch (error) {

            console.error(
                "❌ Failed to load delegate awards:",
                error
            );


            this.updateAwardCount(0);

            this.showAwardsError();
        }
    },


    /* =====================================================
       UPDATE COUNTERS
    ===================================================== */

    updateAwardCount(count) {

        const countElement =
            document.getElementById(
                "awardCount"
            );


        const sectionCount =
            document.getElementById(
                "awardSectionCount"
            );


        if (countElement) {

            countElement.textContent =
                count;
        }


        if (sectionCount) {

            sectionCount.textContent =
                `${count} Award${
                    count === 1
                        ? ""
                        : "s"
                }`;
        }
    },


    /* =====================================================
       RENDER AWARDS
    ===================================================== */

    renderAwards(awards) {

        const container =
            document.getElementById(
                "awardsList"
            );


        if (!container) {
            return;
        }


        if (
            !Array.isArray(awards) ||
            awards.length === 0
        ) {

            container.innerHTML = `

                <div
                    class="achievement-empty">

                    <i
                        class="fa-solid fa-trophy">
                    </i>

                    <strong>
                        No Awards Yet
                    </strong>

                    <span>
                        Awards you earn during FIC FURY
                        will appear here.
                    </span>

                </div>

            `;

            return;
        }


        container.innerHTML =
            awards
                .map(
                    award =>
                        this.createAwardCard(
                            award
                        )
                )
                .join("");
    },


    /* =====================================================
       CREATE AWARD CARD
    ===================================================== */

    createAwardCard(award) {

        /*
         * The dashboard's Award objects may already be
         * normalized, while other versions of the backend
         * return the nested registration structure.
         *
         * Support both forms.
         */

        const registration =
            award?.registration || {};


        const delegateName =
            award?.delegateName ||
            registration?.user?.fullName ||
            "Delegate";


        const committeeName =
            award?.committeeName ||
            registration?.committee?.name ||
            "Committee";


        const characterName =
            award?.characterName ||
            registration?.character?.name ||
            registration?.character?.title ||
            "";


        const awardType =
            award?.awardType ||
            "Award";


        const presentedBy =
            award?.presentedBy ||
            "FIC FURY";


        const presentedDate =
            award?.date ||
            award?.presentedDate ||
            "";


        const citation =
            award?.citation ||
            award?.remarks ||
            "";


        const readableAwardType =
            this.formatAwardType(
                awardType
            );


        const formattedDate =
            this.formatDate(
                presentedDate
            );


        return `

            <article
                class="achievement-card">

                <div
                    class="achievement-card-main">

                    <div
                        class="achievement-card-icon">

                        <i
                            class="fa-solid fa-trophy">
                        </i>

                    </div>


                    <div
                        class="achievement-card-info">

                        <h3>
                            ${this.escapeHtml(
                                readableAwardType
                            )}
                        </h3>


                        <p>
                            ${this.escapeHtml(
                                committeeName
                            )}

                            ${
                                characterName
                                    ? ` • ${this.escapeHtml(
                                        characterName
                                    )}`
                                    : ""
                            }
                        </p>


                        ${
                            formattedDate
                                ? `
                                    <small>
                                        Awarded on
                                        ${this.escapeHtml(
                                            formattedDate
                                        )}
                                    </small>
                                `
                                : ""
                        }


                        ${
                            citation
                                ? `
                                    <small>
                                        ${this.escapeHtml(
                                            citation
                                        )}
                                    </small>
                                `
                                : ""
                        }

                    </div>

                </div>


                <div
                    class="achievement-card-actions">

                    <span
                        class="panel-count">

                        Presented by
                        ${this.escapeHtml(
                            presentedBy
                        )}

                    </span>

                </div>

            </article>

        `;
    },


    /* =====================================================
       FORMAT AWARD TYPE
    ===================================================== */

    formatAwardType(type) {

        const labels = {

            BEST_DELEGATE:
                "Best Delegate",

            OUTSTANDING_DELEGATE:
                "Outstanding Delegate",

            HONORABLE_MENTION:
                "Honorable Mention",

            HIGH_COMMENDATION:
                "High Commendation",

            PARTICIPATION:
                "Participation"

        };


        if (!type) {
            return "Award";
        }


        return (
            labels[type] ||
            String(type)
                .replaceAll(
                    "_",
                    " "
                )
                .replace(
                    /\b\w/g,
                    character =>
                        character.toUpperCase()
                )
        );
    },


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    formatDate(value) {

        if (!value) {
            return "";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    },


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    escapeHtml(value) {

        return String(
            value ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    },


    /* =====================================================
       ERROR STATE
    ===================================================== */

    showAwardsError() {

        const container =
            document.getElementById(
                "awardsList"
            );


        if (!container) {
            return;
        }


        container.innerHTML = `

            <div
                class="achievement-empty">

                <i
                    class="fa-solid fa-triangle-exclamation">
                </i>

                <strong>
                    Unable to Load Awards
                </strong>

                <span>
                    We couldn't retrieve your awards
                    right now. Please try refreshing
                    the page.
                </span>

            </div>

        `;
    },

    /* =====================================================
   LOAD CERTIFICATES
===================================================== */

async loadCertificates() {

    const container =
        document.getElementById(
            "certificatesList"
        );

    if (!container) {
        console.warn(
            "#certificatesList not found."
        );
        return;
    }

    try {

        console.log(
            "📜 Loading delegate certificates..."
        );

        /*
         * Use the authenticated delegate context.
         * Do not send a user ID from the frontend.
         */

        const certificates =
            await apiRequest(
                "/certificates/my"
            );

        console.log(
            "📜 Delegate certificates:",
            certificates
        );

        const list =
            Array.isArray(certificates)
                ? certificates
                : [];

        this.updateCertificateCount(
            list.length
        );

        this.renderCertificates(
            list
        );

    } catch (error) {

        console.error(
            "❌ Failed to load certificates:",
            error
        );

        this.updateCertificateCount(0);

        this.showCertificatesError();
    }
},
/* =====================================================
   CERTIFICATE COUNT
===================================================== */

updateCertificateCount(count) {

    const countElement =
        document.getElementById(
            "certificateCount"
        );

    const sectionCount =
        document.getElementById(
            "certificateSectionCount"
        );

    if (countElement) {

        countElement.textContent =
            count;
    }

    if (sectionCount) {

        sectionCount.textContent =
            `${count} Certificate${
                count === 1
                    ? ""
                    : "s"
            }`;
    }
},
/* =====================================================
   RENDER CERTIFICATES
===================================================== */

renderCertificates(certificates) {

    const container =
        document.getElementById(
            "certificatesList"
        );

    if (!container) {
        return;
    }

    if (
        !Array.isArray(certificates) ||
        certificates.length === 0
    ) {

        container.innerHTML = `

            <div class="achievement-empty">

                <i class="fa-solid fa-certificate"></i>

                <strong>
                    No Certificates Yet
                </strong>

                <span>
                    Certificates issued to you will
                    appear here.
                </span>

            </div>

        `;

        return;
    }

    container.innerHTML =
        certificates
            .map(
                certificate =>
                    this.createCertificateCard(
                        certificate
                    )
            )
            .join("");

    this.bindCertificateDownloads();
},
/* =====================================================
   CREATE CERTIFICATE CARD
===================================================== */

createCertificateCard(certificate) {

    const type =
        this.formatCertificateType(
            certificate?.certificateType
        );

    const committee =
        certificate?.committeeName ||
        certificate?.committee?.name ||
        "FIC FURY";

    const certificateNumber =
        certificate?.certificateNumber ||
        "Certificate number unavailable";

    const issuedDate =
        this.formatDate(
            certificate?.issuedAt ||
            certificate?.issueDate ||
            certificate?.createdAt
        );

    const certificateId =
        certificate?.id;


    return `

        <article class="achievement-card">

            <div class="achievement-card-main">

                <div class="achievement-card-icon">

                    <i class="fa-solid fa-certificate"></i>

                </div>


                <div class="achievement-card-info">

                    <h3>
                        ${this.escapeHtml(type)}
                    </h3>

                    <p>
                        ${this.escapeHtml(committee)}
                    </p>

                    <span class="certificate-number">
                        ${this.escapeHtml(
                            certificateNumber
                        )}
                    </span>

                    ${
                        issuedDate
                            ? `
                                <small>
                                    Issued on
                                    ${this.escapeHtml(
                                        issuedDate
                                    )}
                                </small>
                            `
                            : ""
                    }

                </div>

            </div>


            <div class="achievement-card-actions">

                ${
                    certificateId
                        ? `
                            <button
                                type="button"
                                class="btn btn-primary certificate-download-btn"
                                data-certificate-id="${certificateId}">

                                <i class="fa-solid fa-download"></i>

                                Download PDF

                            </button>
                        `
                        : ""
                }

            </div>

        </article>

    `;
},
/* =====================================================
   CERTIFICATE TYPE
===================================================== */

formatCertificateType(type) {

    const labels = {

        BEST_DELEGATE:
            "Best Delegate",

        OUTSTANDING_DELEGATE:
            "Outstanding Delegate",

        HONORABLE_MENTION:
            "Honorable Mention",

        HIGH_COMMENDATION:
            "High Commendation",

        PARTICIPATION:
            "Participation",

        CHAIRPERSON:
            "Chairperson"

    };

    if (!type) {
        return "Certificate";
    }

    return (
        labels[type] ||
        String(type)
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                character =>
                    character.toUpperCase()
            )
    );
},
/* =====================================================
   CERTIFICATE DOWNLOADS
===================================================== */

bindCertificateDownloads() {

    const container =
        document.getElementById(
            "certificatesList"
        );

    if (!container) {
        return;
    }

    container
        .querySelectorAll(
            ".certificate-download-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    this.downloadCertificate(
                        button.dataset.certificateId,
                        button
                    );

                }
            );

        });
},

async downloadCertificate(
    certificateId,
    button
) {

    if (!certificateId) {

        console.error(
            "❌ Missing certificate ID."
        );

        return;
    }


    const originalHTML =
        button.innerHTML;


    try {

        button.disabled = true;

        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Downloading...
        `;


        const token =
            localStorage.getItem(
                "ficfury_token"
            );


        if (!token) {

            throw new Error(
                "Authentication token not found."
            );
        }


        console.log(
            "📜 Downloading certificate:",
            certificateId
        );


        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/certificates/${certificateId}/download`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            let message =
                `HTTP ${response.status}`;


            try {

                const errorData =
                    await response.json();


                message =
                    errorData.message ||
                    errorData.error ||
                    message;

            } catch (_) {
                // Response wasn't JSON.
            }


            throw new Error(
                message
            );
        }


        const blob =
            await response.blob();


        if (
            !blob ||
            blob.size === 0
        ) {

            throw new Error(
                "The certificate PDF is empty."
            );
        }


        /*
         * Get filename from Content-Disposition
         * when the backend provides it.
         */

        const contentDisposition =
            response.headers.get(
                "Content-Disposition"
            );


        let filename =
            `FIC-FURY-Certificate-${certificateId}.pdf`;


        if (contentDisposition) {

            const match =
                contentDisposition.match(
                    /filename="?([^"]+)"?/i
                );


            if (match && match[1]) {

                filename =
                    match[1];
            }
        }


        const downloadUrl =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            downloadUrl;


        link.download =
            filename;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            downloadUrl
        );


        console.log(
            "✅ Certificate downloaded:",
            filename
        );


    } catch (error) {

        console.error(
            "❌ Certificate download failed:",
            error
        );


        if (
            typeof this.showMessage ===
            "function"
        ) {

            this.showMessage(
                error.message ||
                "Failed to download certificate.",
                "error"
            );

        } else {

            alert(
                error.message ||
                "Failed to download certificate."
            );
        }


    } finally {

        button.disabled = false;

        button.innerHTML =
            originalHTML;
    }
},

};


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AchievementsPage.init();

    }
);