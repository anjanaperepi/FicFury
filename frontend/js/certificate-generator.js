const CERTIFICATE_LAYOUT = {

    award: {
        x: 50.09,
        y: 46.80
    },

    recipient: {
        x: 50,
        y: 57.2
    },

    character: {
        x: 46.62,
        y: 64.04
    },

    committee: {
        x: 50,
        y: 74
    },

    event: {
        x: 50,
        y: 77.8
    },

    chairperson: {
        x: 29.79,
        y: 84.71
    },

    certificateNumber: {
        x: 77.4,
        y: 93.1
    },

    date: {
        x: 70.3,
        y: 89.68
    }

};

const CertificateGenerator = {

    committees: [],

    recipients: [],

    selectedRecipients: new Set(),


    async init() {

        console.log(
            "📜 Certificate Generator initializing..."
        );

        this.bindEvents();

        this.applyCertificateLayout();

        await this.loadCommittees();

        

        await this.loadGeneratedCertificates();


        console.log(
            "✅ Certificate Generator initialized"
        );
    },


    // =====================================================
    // EVENTS
    // =====================================================

    bindEvents() {

        const committeeSelect =
        
            document.getElementById(
                "committeeSelect"
            );

        const selectAllBtn =
            document.getElementById(
                "selectAllBtn"
            );

        const clearAllBtn =
            document.getElementById(
                "clearAllBtn"
            );

        const previewBtn =
            document.getElementById(
                "previewBtn"
            );

        const generateBtn =
            document.getElementById(
                "generateBtn"
            );


        const closePreviewBtn =
    document.getElementById(
        "closePreviewBtn"
    );

const cancelPreviewBtn =
    document.getElementById(
        "cancelPreviewBtn"
    );

const confirmPreviewBtn =
    document.getElementById(
        "confirmPreviewBtn"
    );


closePreviewBtn?.addEventListener(
    "click",
    () => this.closePreview()
);


cancelPreviewBtn?.addEventListener(
    "click",
    () => this.closePreview()
);


confirmPreviewBtn?.addEventListener(
    "click",
    () => this.confirmPreview()
);


        committeeSelect?.addEventListener(
            "change",
            () => this.onCommitteeChange()
        );



        selectAllBtn?.addEventListener(
            "click",
            () => this.selectAll()
        );


        clearAllBtn?.addEventListener(
            "click",
            () => this.clearAll()
        );


        previewBtn?.addEventListener(
            "click",
            () => this.previewCertificate()
        );


        generateBtn?.addEventListener(
            "click",
            () => this.generateCertificates()
        );

        const calibrationBtn =
    document.getElementById(
        "calibrationBtn"
    );

calibrationBtn?.addEventListener(
    "click",
    () => this.enableCalibrationMode()
);
    },
closePreview() {

    const modal =
        document.getElementById(
            "certificatePreviewModal"
        );


    if (modal) {

        modal.hidden = true;

        document.body.style.overflow =
            "";
    }
},
confirmPreview() {

    this.closePreview();

    this.showMessage(
        "Certificate design approved. The PDF generation step is next.",
        "success"
    );

    console.log(
        "📜 Certificate design approved."
    );
},

    // =====================================================
    // LOAD COMMITTEES
    // =====================================================

    async loadCommittees() {

        const select =
            document.getElementById(
                "committeeSelect"
            );


        if (!select) {
            return;
        }


        try {

            const response =
                await apiRequest(
                    "/committees",
                    "GET"
                );


            console.log(
                "📋 Committees:",
                response
            );


            /*
             * Some of your existing APIs return
             * the array directly while others may
             * wrap it in a data property.
             */

            this.committees =
                Array.isArray(response)
                    ? response
                    : (
                        response?.data ||
                        response?.content ||
                        []
                    );


            select.innerHTML = `
                <option value="">
                    Select committee
                </option>
            `;


            this.committees.forEach(
                committee => {

                    if (!committee?.id) {
                        return;
                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        committee.id;


                    option.textContent =
                        committee.name ||
                        `Committee ${committee.id}`;


                    select.appendChild(
                        option
                    );
                }
            );


        } catch (error) {

            console.error(
                "❌ Failed to load committees:",
                error
            );


            this.showMessage(
                "Failed to load committees.",
                "error"
            );
        }
    },


async onCommitteeChange() {

    const select =
        document.getElementById(
            "committeeSelect"
        );

    const committeeId =
        select?.value;

    this.recipients = [];
    this.selectedRecipients.clear();

    this.updateGenerateButton();

    if (!committeeId) {

        this.renderEmptyState(
            "No Committee Selected",
            "Select a committee above to view eligible recipients."
        );

        return;
    }

    await this.loadRecipients(
        committeeId
    );
},

    // =====================================================
    // LOAD ELIGIBLE RECIPIENTS
    // =====================================================

    async loadRecipients(
        committeeId
    ) {

        const container =
            document.getElementById(
                "recipientList"
            );


        const summary =
            document.getElementById(
                "recipientSummary"
            );


        if (!container) {
            return;
        }


        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <h3>
                    Loading Recipients
                </h3>

                <p>
                    Checking active registrations...
                </p>

            </div>
        `;


        try {

const response =
    await apiRequest(
        `/certificates/eligible?committeeId=${encodeURIComponent(
            committeeId
        )}`,
        "GET"
    );
            console.log(
                "👥 Eligible recipients:",
                response
            );


            this.recipients =
                Array.isArray(response)
                    ? response
                    : (
                        response?.data ||
                        []
                    );


            this.selectedRecipients.clear();


            if (
                summary
            ) {

                summary.textContent =
                    `${this.recipients.length} eligible recipient${
                        this.recipients.length === 1
                            ? ""
                            : "s"
                    }`;
            }


            if (
                this.recipients.length === 0
            ) {

                this.renderEmptyState(
                    "No Eligible Recipients",
                    "There are no active registrations for this committee."
                );

                return;
            }


            this.renderRecipients();


        } catch (error) {

            console.error(
                "❌ Failed to load recipients:",
                error
            );


            this.renderEmptyState(
                "Unable to Load Recipients",
                "The eligible recipients could not be loaded."
            );


            this.showMessage(
                "Failed to load eligible recipients.",
                "error"
            );
        }
    },


    // =====================================================
    // RENDER RECIPIENTS
    // =====================================================

    renderRecipients() {

        const container =
            document.getElementById(
                "recipientList"
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            this.recipients
                .map(
                    recipient =>
                        this.createRecipientRow(
                            recipient
                        )
                )
                .join("");


        container
            .querySelectorAll(
                ".recipient-checkbox"
            )
            .forEach(
                checkbox => {

                    checkbox.addEventListener(
                        "change",
                        event =>
                            this.toggleRecipient(
                                Number(
                                    event.target.dataset.id
                                ),
                                event.target.checked
                            )
                    );
                }
            );
    },


    // =====================================================
    // RECIPIENT ROW
    // =====================================================

    createRecipientRow(
        recipient
    ) {

        const id =
            Number(
                recipient.registrationId
            );


        const name =
            this.escapeHtml(
                recipient.recipientName ||
                "Unknown Recipient"
            );


        const character =
            this.escapeHtml(
                recipient.characterName ||
                "No character"
            );

        const award =
    this.escapeHtml(
        this.formatAwardType(
            recipient.awardType
        )
    );


return `
    <label class="recipient-row">

        <input
            type="checkbox"
            class="recipient-checkbox"
            data-id="${id}"
        >

        <div class="recipient-info">

            <div class="recipient-name">
                ${name}
            </div>

            <div class="recipient-character">
                Character:
                ${character}
            </div>

            <div class="recipient-award">
                Award:
                <strong>${award}</strong>
            </div>

        </div>

    </label>
`;
    },


    // =====================================================
    // TOGGLE RECIPIENT
    // =====================================================

    toggleRecipient(
        registrationId,
        selected
    ) {

        if (selected) {

            this.selectedRecipients.add(
                registrationId
            );

        } else {

            this.selectedRecipients.delete(
                registrationId
            );
        }


        this.updateGenerateButton();
    },


    // =====================================================
    // SELECT ALL
    // =====================================================

    selectAll() {

        this.recipients.forEach(
            recipient => {

                this.selectedRecipients.add(
                    Number(
                        recipient.registrationId
                    )
                );
            }
        );


        document
            .querySelectorAll(
                ".recipient-checkbox"
            )
            .forEach(
                checkbox => {
                    checkbox.checked = true;
                }
            );


        this.updateGenerateButton();
    },


    // =====================================================
    // CLEAR ALL
    // =====================================================

    clearAll() {

        this.selectedRecipients.clear();


        document
            .querySelectorAll(
                ".recipient-checkbox"
            )
            .forEach(
                checkbox => {
                    checkbox.checked = false;
                }
            );


        this.updateGenerateButton();
    },


    // =====================================================
    // BUTTON STATE
    // =====================================================

    updateGenerateButton() {

        const generateBtn =
            document.getElementById(
                "generateBtn"
            );


        const previewBtn =
            document.getElementById(
                "previewBtn"
            );


        const hasRecipients =
            this.selectedRecipients.size > 0;


        if (previewBtn) {

            previewBtn.disabled =
                !hasRecipients;
        }


        if (generateBtn) {

            generateBtn.disabled =
                !hasRecipients;
        }
    },


    // =====================================================
    // PREVIEW
    // =====================================================

previewCertificate() {




    const eventName =
        document.getElementById(
            "eventName"
        )?.value.trim();





    if (!eventName) {

        this.showMessage(
            "Please enter the event name.",
            "error"
        );

        return;
    }


    if (
        this.selectedRecipients.size === 0
    ) {

        this.showMessage(
            "Please select at least one recipient.",
            "error"
        );

        return;
    }


    const recipient =
        this.recipients.find(
            item =>
                this.selectedRecipients.has(
                    Number(
                        item.registrationId
                    )
                )
        );


    if (!recipient) {

        this.showMessage(
            "Unable to determine the selected recipient.",
            "error"
        );

        return;
    }

    const awardType =
    recipient.awardType;

if (!awardType) {

    this.showMessage(
        "The selected recipient has no assigned award.",
        "error"
    );

    return;
}


    /*
     * Populate preview
     */

document.getElementById(
    "previewCertificateType"
).textContent =
    this.formatAwardType(
        awardType
    );


    document.getElementById(
        "previewRecipientName"
    ).textContent =
        recipient.recipientName ||
        "Recipient Name";


document.getElementById(
    "previewCharacter"
).textContent =
    recipient.characterName || "";


    document.getElementById(
        "previewEventName"
    ).textContent =
        eventName;


    document.getElementById(
        "previewCommitteeName"
    ).textContent =
        recipient.committeeName ||
        "Committee";
const selectedCommittee =
    this.committees.find(
        committee =>
            Number(committee.id) ===
            Number(
                document.getElementById(
                    "committeeSelect"
                )?.value
            )
    );

console.log(
    "📜 SELECTED COMMITTEE:",
    selectedCommittee
);

document.getElementById(
    "previewChairperson"
).textContent =
    selectedCommittee?.chairName ||
    selectedCommittee?.chairpersonName ||
    "";
const date =
    "DATE:  " +
    new Date().toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

document.getElementById(
    "previewDate"
).textContent = date;

document.getElementById(
    "previewCertificateNumber"
).textContent =
    "";


    /*
     * Open modal
     */

    const modal =
        document.getElementById(
            "certificatePreviewModal"
        );


    if (modal) {

        modal.hidden = false;

        document.body.style.overflow =
            "hidden";
    }
},
formatAwardType(type) {

    const labels = {

        BEST_DELEGATE:
            "Best Delegate",

        OUTSTANDING_DELEGATE:
            "Outstanding Delegate",

        HIGH_COMMENDATION:
            "High Commendation",

        SPECIAL_MENTION:
            "Special Mention",

        VERBAL_MENTION:
            "Verbal Mention",

        PARTICIPATION:
            "Participation"
    };

    return (
        labels[type] ||
        type ||
        ""
    );
},

    // =====================================================
    // GENERATE
    // =====================================================

async generateCertificates() {

    const committeeId =
        document.getElementById(
            "committeeSelect"
        )?.value;

    const eventName =
        document.getElementById(
            "eventName"
        )?.value.trim();



    // ==========================================
    // VALIDATION
    // ==========================================

    if (!committeeId) {

        this.showMessage(
            "Please select a committee.",
            "error"
        );

        return;
    }


    if (!eventName) {

        this.showMessage(
            "Please enter the event name.",
            "error"
        );

        return;
    }




    if (
        this.selectedRecipients.size === 0
    ) {

        this.showMessage(
            "Please select at least one recipient.",
            "error"
        );

        return;
    }


    // ==========================================
    // BUILD REQUEST
    // ==========================================

const payload = {

    committeeId:
        Number(committeeId),

    eventName:
        eventName,

    registrationIds:
        Array.from(
            this.selectedRecipients
        )
};


    console.log(
        "📜 Generating certificates:",
        payload
    );


    const generateBtn =
        document.getElementById(
            "generateBtn"
        );


    try {

        // ======================================
        // DISABLE BUTTON
        // ======================================

        if (generateBtn) {

            generateBtn.disabled = true;

            generateBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Generating...
            `;
        }


        // ======================================
        // API CALL
        // ======================================

        const certificates =
            await apiRequest(
                "/certificates/generate",
                "POST",
                payload
            );


        console.log(
            "✅ Generated certificates:",
            certificates
        );


        // ======================================
        // SUCCESS
        // ======================================

        const count =
            Array.isArray(certificates)
                ? certificates.length
                : 0;


        this.showMessage(
            `${count} certificate${
                count === 1 ? "" : "s"
            } generated successfully.`,
            "success"
        );


        // ======================================
        // SHOW RESULTS
        // ======================================

        this.showGeneratedCertificates(
            certificates
        );


        this.selectedRecipients.clear();

        this.updateGenerateButton();

    } catch (error) {

        console.error(
            "❌ Certificate generation failed:",
            error
        );


this.showMessage(
    error?.message ||
    "Failed to generate certificates.",
    "error"
);

    } finally {

        if (generateBtn) {

            generateBtn.disabled = false;

            generateBtn.innerHTML = `
                <i class="fa-solid fa-certificate"></i>
                Generate Certificates
            `;
        }
    }
},


showGeneratedCertificates(certificates) {

    const section =
        document.getElementById(
            "generatedCertificatesSection"
        );

    const list =
        document.getElementById(
            "generatedCertificatesList"
        );

    const summary =
        document.getElementById(
            "generatedCertificatesSummary"
        );


    if (!section || !list) {
        return;
    }


    if (
        !Array.isArray(certificates) ||
        certificates.length === 0
    ) {

        section.hidden = true;

        return;
    }


    // ==========================================
    // SUMMARY
    // ==========================================

    if (summary) {

        summary.textContent =
            `${certificates.length} certificate${
                certificates.length === 1
                    ? ""
                    : "s"
            } generated successfully.`;
    }


    // ==========================================
    // CERTIFICATE ROWS
    // ==========================================

    list.innerHTML =
        certificates
            .map(
                certificate => {

                    const recipientName =
                        this.escapeHtml(
                            certificate.recipientName ||
                            "Unknown Recipient"
                        );


const certificateType =
    this.escapeHtml(
        this.formatAwardType(
            certificate.certificateType
        )
    );


                    const certificateNumber =
                        this.escapeHtml(
                            certificate.certificateNumber ||
                            "N/A"
                        );


                    return `

                        <div
                            class="generated-certificate-row">

                            <div
                                class="generated-certificate-info">

                                <strong>
                                    ${recipientName}
                                </strong>

                                <span>
                                    ${certificateType}
                                </span>

                                <code>
                                    ${certificateNumber}
                                </code>

                            </div>


                            <button
                                type="button"
                                class="btn btn-primary download-certificate-btn"
                                data-certificate-id="${certificate.id}">

                                <i class="fa-solid fa-download"></i>

                                Download PDF

                            </button>

                        </div>

                    `;
                }
            )
            .join("");


    // ==========================================
    // SHOW SECTION
    // ==========================================

    section.hidden = false;


    console.log(
    "📜 Generated certificate section:",
    section
);

console.log(
    "📜 Generated certificate rows:",
    list.children.length
);


    // ==========================================
    // DOWNLOAD BUTTON EVENTS
    // ==========================================

    list
        .querySelectorAll(
            ".download-certificate-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.downloadCertificate(
                            button.dataset
                                .certificateId,
                            button
                        );

                    }
                );
            }
        );
},
async loadGeneratedCertificates() {

    const section =
        document.getElementById(
            "generatedCertificatesSection"
        );

    const list =
        document.getElementById(
            "generatedCertificatesList"
        );

    if (!section || !list) {
        return;
    }

    try {

        console.log(
            "📜 Loading existing certificates..."
        );

        const certificates =
            await apiRequest(
                "/certificates",
                "GET"
            );

        console.log(
            "📜 Existing certificates:",
            certificates
        );

        /*
         * Let the existing renderer handle
         * displaying the certificates.
         */
        this.showGeneratedCertificates(
            certificates
        );

        console.log(
            "📜 Certificates rendered:",
            list.children.length
        );

    } catch (error) {

        console.error(
            "❌ Failed to load generated certificates:",
            error
        );

        section.hidden = true;
    }
},
bindDownloadButtons() {

    const list =
        document.getElementById(
            "generatedCertificatesList"
        );


    if (!list) {
        return;
    }


    list
        .querySelectorAll(
            ".download-certificate-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.downloadCertificate(
                            button.dataset
                                .certificateId,
                            button
                        );

                    }
                );
            }
        );
},
async downloadCertificate(
    certificateId,
    button
) {

    if (!certificateId) {

        this.showMessage(
            "Certificate ID is missing.",
            "error"
        );

        return;
    }


    const originalHtml =
        button?.innerHTML;


    try {

        if (button) {

            button.disabled = true;

            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Downloading...
            `;
        }


        /*
         * We will use a dedicated download
         * request because PDF responses are
         * different from normal JSON API responses.
         */

        const token =
            localStorage.getItem(
                "ficfury_token"
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

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const blob =
            await response.blob();


        /*
         * Create temporary browser URL
         */

        const url =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;


        link.download =
            `certificate-${certificateId}.pdf`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            url
        );


    } catch (error) {

        console.error(
            "❌ Certificate download failed:",
            error
        );


        this.showMessage(
            "Failed to download certificate.",
            "error"
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                originalHtml;
        }
    }
},
savePdfBlob(
    blob,
    certificateId
) {

    const url =
        window.URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        `certificate-${certificateId}.pdf`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    window.URL.revokeObjectURL(
        url
    );
},
    // =====================================================
    // EMPTY STATE
    // =====================================================

    renderEmptyState(
        title,
        message
    ) {

        const container =
            document.getElementById(
                "recipientList"
            );


        if (!container) {
            return;
        }


        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-users"></i>

                <h3>
                    ${this.escapeHtml(title)}
                </h3>

                <p>
                    ${this.escapeHtml(message)}
                </p>

            </div>

        `;
    },


    // =====================================================
    // MESSAGE
    // =====================================================

    showMessage(
        message,
        type = "success"
    ) {

        const element =
            document.getElementById(
                "certificateMessage"
            );


        if (!element) {
            return;
        }


        element.textContent =
            message;


        element.className =
            `certificate-message ${type}`;


        element.hidden = false;


        setTimeout(
            () => {
                element.hidden = true;
            },
            5000
        );
    },


    // =====================================================
    // SECURITY
    // =====================================================

    escapeHtml(value) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            String(
                value ?? ""
            );


        return div.innerHTML;
    },
applyCertificateLayout() {

    const certificate =
        document.getElementById(
            "certificatePreview"
        );

    if (!certificate) {
        return;
    }

    const fieldMap = {

        award:
            "previewCertificateType",

        recipient:
            "previewRecipientName",

        character:
            "previewCharacter",

        committee:
            "previewCommitteeName",

        event:
            "previewEventName",

        chairperson:
            "previewChairperson",

        date:
            "previewDate",

        certificateNumber:
            "previewCertificateNumber"

    };

    Object.entries(fieldMap).forEach(
        ([field, elementId]) => {

            const element =
                document.getElementById(
                    elementId
                );

            const position =
                CERTIFICATE_LAYOUT[field];

            if (!element || !position) {
                return;
            }

            element.style.left =
                `${position.x}%`;

            element.style.top =
                `${position.y}%`;

            /*
             * We are now using TOP coordinates
             * everywhere.
             */
            element.style.bottom =
                "auto";

        }
    );

},
enableCalibrationMode() {

const certificate =
    document.querySelector(
        "#certificatePreview .certificate-border"
    );

    if (!certificate) {
        return;
    }

    const calibrationMode =
        !certificate.classList.contains(
            "calibration-mode"
        );

    certificate.classList.toggle(
        "calibration-mode",
        calibrationMode
    );

    const calibrationBtn =
        document.getElementById(
            "calibrationBtn"
        );

    if (calibrationBtn) {

        calibrationBtn.textContent =
            calibrationMode
                ? "📐 Exit Calibration"
                : "📐 Calibration Mode";
    }

    const fields = [
        "previewCertificateType",
        "previewRecipientName",
        "previewCharacter",
        "previewEventName",
        "previewCommitteeName",
        "previewChairperson",
        "previewDate",
        "previewCertificateNumber"
    ];

    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        if (calibrationMode) {

            this.makeFieldDraggable(
                element
            );

        }

    });

},
makeFieldDraggable(element) {

    if (!element) {
        return;
    }

    if (element.dataset.calibrationBound === "true") {
    return;
}

element.dataset.calibrationBound = "true";

    let dragging = false;

    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener(
        "mousedown",
        event => {

            dragging = true;

            element.classList.add(
    "calibration-dragging"
);

            const rect =
                element.getBoundingClientRect();

            offsetX =
                event.clientX -
                (rect.left + rect.width / 2);

            offsetY =
                event.clientY -
                (rect.top + rect.height / 2);

            event.preventDefault();

        }
    );

    document.addEventListener(
        "mousemove",
        event => {

            if (!dragging) {
                return;
            }

const certificate =
    document.querySelector(
        "#certificatePreview .certificate-border"
    );
            if (!certificate) {
                return;
            }

            const parentRect =
                certificate.getBoundingClientRect();

            const x =
                (
                    (
                        event.clientX -
                        parentRect.left -
                        offsetX
                    )
                    / parentRect.width
                ) * 100;

            const y =
                (
                    (
                        event.clientY -
                        parentRect.top -
                        offsetY
                    )
                    / parentRect.height
                ) * 100;

            element.style.left =
                `${x}%`;

            element.style.top =
                `${y}%`;

            element.style.bottom =
                "auto";

            element.style.transform =
                "translate(-50%, -50%)";

        }
    );

    document.addEventListener(
        "mouseup",
        () => {

            if (!dragging) {
                return;
            }

            dragging = false;

            element.classList.remove(
    "calibration-dragging"
);

const certificate =
    document.querySelector(
        "#certificatePreview .certificate-border"
    );

            const parentRect =
                certificate.getBoundingClientRect();

            const rect =
                element.getBoundingClientRect();

            const x =
                (
                    (
                        rect.left +
                        rect.width / 2 -
                        parentRect.left
                    )
                    / parentRect.width
                ) * 100;

            const y =
                (
                    (
                        rect.top +
                        rect.height / 2 -
                        parentRect.top
                    )
                    / parentRect.height
                ) * 100;

const fieldMap = {

    previewCertificateType:
        "award",

    previewRecipientName:
        "recipient",

    previewCharacter:
        "character",

    previewEventName:
        "event",

    previewCommitteeName:
        "committee",

    previewChairperson:
        "chairperson",

    previewDate:
        "date",

    previewCertificateNumber:
        "certificateNumber"
};

const fieldName =
    fieldMap[element.id] ||
    element.id;

console.log(
    `📐 ${fieldName}:`,
    `x: ${Number(x.toFixed(2))},`,
    `y: ${Number(y.toFixed(2))}`
);

        }
    );

},

};


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        CertificateGenerator.init();

    }
);