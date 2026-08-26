/* =========================================================
   FIC FURY — DIPLOMACY
   Backend-connected conversation system
   ========================================================= */

const Diplomacy = {

    state: {
        token: null,
        role: null,
        user: null,

        committeeId: null,
        sessionId: null,
        session: null,

        conversations: [],
        currentConversation: null,
        messages: [],
        unreadCounts: {},

        delegates: [],
        selectedParticipantIds: [],
        newConversationType: "PUBLIC_GROUP",

        oversightConversations: [],
    },


    elements: {},


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    async init() {

        console.log("🤝 Diplomacy initializing...");

        this.loadLoggedInUser();

        if (!this.state.token || !this.state.user) {

            console.warn(
                "Diplomacy: no authenticated user found."
            );

            this.updateStatus(
                "Authentication required",
                "Please log in to access Diplomacy."
            );

            return;
        }

        this.cacheElements();

        this.setupBackButton();

        this.setupRoleView();

        this.setupComposer();

        this.setupNewConversationButton();

        try {

            await this.loadActiveSession();

            if (!this.state.sessionId) {

                this.updateStatus(
                    "No active session",
                    "There is currently no active committee session."
                );

                return;
            }



if (
    this.state.role === "CHAIR" ||
    this.state.role === "CO_CHAIR"
) {

    // Chair uses the dedicated oversight endpoint.
    await this.loadChairOversight();

} else {

    // Delegates use the normal visible-conversations endpoint.
    await this.loadConversations();
}

            this.updateStatus(
                "Diplomacy ready",
                "Public and private council communication is available."
            );

            console.log(
                "✅ Diplomacy initialized:",
                this.state
            );

        } catch (error) {

            console.error(
                "❌ Diplomacy initialization failed:",
                error
            );

            this.updateStatus(
                "Unable to load Diplomacy",
                this.getErrorMessage(error)
            );
        }
    },


    /* =====================================================
       AUTH / USER
    ====================================================== */

    loadLoggedInUser() {

        this.state.token =
            localStorage.getItem(
                CONFIG.TOKEN_KEY
            );

        this.state.committeeId =
            localStorage.getItem(
                "committeeId"
            );


        try {

            this.state.user =
                JSON.parse(
                    localStorage.getItem(
                        CONFIG.USER_KEY
                    )
                );

        } catch (error) {

            console.error(
                "Unable to parse logged-in user:",
                error
            );

            this.state.user = null;
        }


        this.state.role =
            this.state.user?.role
                ? String(
                    this.state.user.role
                ).toUpperCase()
                : null;


        console.log(
            "Diplomacy user:",
            this.state.user
        );

        console.log(
            "Diplomacy role:",
            this.state.role
        );

        console.log(
            "Diplomacy committee:",
            this.state.committeeId
        );
    },


    /* =====================================================
       DOM
    ====================================================== */

    cacheElements() {

        this.elements = {

            statusTitle:
                document.getElementById(
                    "diplomacyStatusTitle"
                ),

            statusMessage:
                document.getElementById(
                    "diplomacyStatusMessage"
                ),


            publicConversation:
                document.querySelector(
                    '.conversation-item[data-conversation="public"]'
                ),

            privateConversationList:
                document.getElementById(
                    "privateConversationList"
                ),


            messageList:
                document.getElementById(
                    "messageList"
                ),

            messageForm:
                document.getElementById(
                    "messageForm"
                ),

            messageInput:
                document.getElementById(
                    "messageInput"
                ),

            messageCounter:
                document.getElementById(
                    "messageCounter"
                ),

            sendMessageBtn:
                document.getElementById(
                    "sendMessageBtn"
                ),


            newConversationBtn:
                document.getElementById(
                    "newConversationBtn"
                ),


            conversationTypeIcon:
                document.getElementById(
                    "conversationTypeIcon"
                ),

            conversationType:
                document.getElementById(
                    "conversationType"
                ),

            conversationTitle:
                document.getElementById(
                    "conversationTitle"
                ),

            chatParticipantInfo:
                document.getElementById(
                    "chatParticipantInfo"
                ),


            chairOversightPanel:
                document.getElementById(
                    "chairOversightPanel"
                ),

            oversightConversationList:
                document.getElementById(
                    "oversightConversationList"
                ),

            newConversationModal:
                document.getElementById("newConversationModal"),

            closeConversationModal:
                document.getElementById("closeConversationModal"),

            cancelConversationBtn:
                document.getElementById("cancelConversationBtn"),

            createConversationBtn:
                document.getElementById("createConversationBtn"),

            participantList:
                document.getElementById("participantList"),

            participantSearch:
                document.getElementById("participantSearch"),

            selectedParticipants:
                document.getElementById("selectedParticipants"),

            selectedParticipantCount:
                document.getElementById("selectedParticipantCount"),

            conversationTypeOptions:
                document.querySelectorAll(
                    "[data-conversation-type]"
                ),


            backToDebateBtn:
                document.getElementById(
                    "backToDebateBtn"
                ),
        };
    },

setupBackButton() {

    if (!this.elements.backToDebateBtn) {
        return;
    }

    this.elements.backToDebateBtn.addEventListener(
        "click",
        () => {
            window.location.href =
                "debate-room.html";
        }
    );
},
    /* =====================================================
       ROLE VIEW
    ====================================================== */

    setupRoleView() {

        const isChair =
            this.state.role === "CHAIR" ||
            this.state.role === "CO_CHAIR";

        document.body.classList.toggle(
            "diplomacy-chair-mode",
            isChair
        );


        if (
            this.elements.chairOversightPanel
        ) {

            this.elements.chairOversightPanel.hidden =
                !isChair;
        }


        /*
         * The normal Diplomacy composer is for delegates.
         *
         * Chair oversight is view-only.
         */

        if (isChair) {

            if (this.elements.messageInput) {

                this.elements.messageInput.disabled =
                    true;

                this.elements.messageInput.placeholder =
                    "Chair oversight — view only";
            }

            if (this.elements.sendMessageBtn) {

                this.elements.sendMessageBtn.disabled =
                    true;
            }

        } else {

            if (this.elements.messageInput) {

                this.elements.messageInput.disabled =
                    false;

                this.elements.messageInput.placeholder =
                    "Write your message...";
            }

            if (this.elements.sendMessageBtn) {

                this.elements.sendMessageBtn.disabled =
                    false;
            }
        }
    },


    /* =====================================================
       SESSION STATUS
    ====================================================== */

    updateStatus(
        title,
        message
    ) {

        if (
            this.elements.statusTitle
        ) {

            this.elements.statusTitle.textContent =
                title;
        }


        if (
            this.elements.statusMessage
        ) {

            this.elements.statusMessage.textContent =
                message;
        }
    },


    /* =====================================================
       ACTIVE SESSION
    ====================================================== */

    async loadActiveSession() {

        let session;


        if (
            this.state.role === "CHAIR" ||
            this.state.role === "CO_CHAIR"
        ) {

            if (!this.state.user?.id) {

                throw new Error(
                    "Chair user ID is unavailable."
                );
            }


session =
    await apiRequest(
        `/debate/sessions/chair/${this.state.user.id}`
    );

        } else {

            if (!this.state.committeeId) {

                throw new Error(
                    "Committee ID is unavailable."
                );
            }


session =
    await apiRequest(
        `/debate/sessions/active/${this.state.committeeId}`
    );
        }


        this.state.session =
            session;

        this.state.sessionId =
            session.id;


        console.log(
            "Diplomacy session:",
            session
        );
    },


    /* =====================================================
       LOAD CONVERSATIONS
    ====================================================== */

    async loadConversations() {

        if (!this.state.sessionId) {

            throw new Error(
                "No active session available."
            );
        }


        /*
         * This endpoint is already verified
         * against your backend.
         */

const conversations =
    await apiRequest(
        `/diplomacy/session/${this.state.sessionId}/conversations`
    );

        this.state.conversations =
            Array.isArray(conversations)
                ? conversations
                : [];


        console.log(
            "Diplomacy conversations:",
            this.state.conversations
        );


        this.renderConversationList();


        /*
         * Automatically select the public council
         * if it exists.
         */

        const publicCouncil =
            this.state.conversations.find(
                conversation =>
                    conversation.type ===
                    "PUBLIC_COUNCIL"
            );


const currentConversationId =
    this.state.currentConversation?.id;

if (currentConversationId) {

    const updatedConversation =
        this.state.conversations.find(
            conversation =>
                Number(conversation.id) ===
                Number(currentConversationId)
        );

    if (updatedConversation) {

        this.state.currentConversation =
            updatedConversation;

        this.renderConversationHeader(
            updatedConversation
        );

        return;
    }
}

/*
 * Initial load only:
 * automatically open Public Council.
 */
if (publicCouncil) {

    await this.selectConversation(
        publicCouncil
    );

} else if (
    this.state.conversations.length > 0
) {

    await this.selectConversation(
        this.state.conversations[0]
    );

} else {

    this.renderEmptyMessages();
}
    },


    /* =====================================================
       RENDER CONVERSATIONS
    ====================================================== */

    renderConversationList() {

        const conversations =
            this.state.conversations;


        /*
         * PUBLIC COUNCIL
         */

        const publicCouncil =
            conversations.find(
                conversation =>
                    conversation.type ===
                    "PUBLIC_COUNCIL"
            );


        if (
            this.elements.publicConversation
        ) {

            if (publicCouncil) {

                this.elements.publicConversation
                    .dataset.conversationId =
                        publicCouncil.id;

                this.elements.publicConversation
                    .dataset.conversationType =
                        publicCouncil.type;

                const title =
                    this.elements.publicConversation
                        .querySelector(
                            "strong"
                        );

                const subtitle =
                    this.elements.publicConversation
                        .querySelector(
                            "small"
                        );

                if (title) {

                    title.textContent =
                        "Public Council";
                }

                if (subtitle) {

                    subtitle.textContent =
                        "Everyone in the council";
                }


                const unreadCount =
    this.state.unreadCounts[
        String(publicCouncil.id)
    ] || 0;

const existingBadge =
    this.elements.publicConversation
        .querySelector(
            ".conversation-unread-badge"
        );

if (existingBadge) {
    existingBadge.remove();
}

if (unreadCount > 0) {

    const badge =
        document.createElement("span");

    badge.className =
        "conversation-unread-badge";

    badge.textContent =
        unreadCount > 99
            ? "99+"
            : unreadCount;

    this.elements.publicConversation
        .appendChild(badge);
}


                this.elements.publicConversation
                    .onclick =
                        () => this.selectConversation(
                            publicCouncil
                        );

            } else {

                this.elements.publicConversation
                    .style.display =
                        "none";
            }
        }


        /*
         * PUBLIC GROUPS
         */

        const publicGroups =
            conversations.filter(
                conversation =>
                    conversation.type ===
                    "PUBLIC_GROUP"
            );


        this.renderPublicGroups(
            publicGroups
        );


        /*
         * PRIVATE GROUPS
         */

        const privateGroups =
            conversations.filter(
                conversation =>
                    conversation.type ===
                    "PRIVATE_GROUP"
            );


        this.renderPrivateGroups(
            privateGroups
        );
    },


    /* =====================================================
       PUBLIC GROUPS
    ====================================================== */

    renderPublicGroups(
        conversations
    ) {

        const privateContainer =
            document.getElementById(
                "privateConversations"
            );


        if (!privateContainer) {
            return;
        }


        /*
         * Remove an old generated section.
         */

        const existing =
            document.getElementById(
                "publicGroupSection"
            );

        if (existing) {
            existing.remove();
        }


        if (
            conversations.length === 0
        ) {
            return;
        }


        const section =
            document.createElement(
                "div"
            );

        section.id =
            "publicGroupSection";

        section.className =
            "public-conversations";


        section.innerHTML = `
            <div class="conversation-section-label">
                PUBLIC GROUPS
            </div>

            <div
                id="publicGroupList"
                class="conversation-list"
            ></div>
        `;


        privateContainer.parentNode.insertBefore(
            section,
            privateContainer
        );


        const list =
            section.querySelector(
                "#publicGroupList"
            );


        conversations.forEach(
            conversation => {

                list.appendChild(
                    this.createConversationElement(
                        conversation
                    )
                );
            }
        );
    },


    /* =====================================================
       PRIVATE GROUPS
    ====================================================== */

    renderPrivateGroups(
        conversations
    ) {

        const container =
            this.elements.privateConversationList;


        if (!container) {
            return;
        }


        container.innerHTML = "";


        if (
            conversations.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-conversations">
                    <i class="fa-solid fa-lock"></i>

                    <span>
                        No private conversations yet.
                    </span>
                </div>
            `;

            return;
        }


        conversations.forEach(
            conversation => {

                container.appendChild(
                    this.createConversationElement(
                        conversation
                    )
                );
            }
        );
    },


    /* =====================================================
       CONVERSATION ELEMENT
    ====================================================== */

    createConversationElement(
        conversation
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "conversation-item";


        button.dataset.conversationId =
            conversation.id;


        button.dataset.conversationType =
            conversation.type;


        const type =
            conversation.type;


        const isPrivate =
            type === "PRIVATE_GROUP";


        const icon =
            isPrivate
                ? "lock"
                : "users";


        const iconClass =
            isPrivate
                ? "private"
                : "public";


        const title =
            this.getConversationTitle(
                conversation
            );


        const subtitle =
            this.getConversationSubtitle(
                conversation
            );


const unreadCount =
    this.state.unreadCounts[
        String(conversation.id)
    ] || 0;

button.innerHTML = `
    <span
        class="conversation-icon ${iconClass}"
    >
        <i class="fa-solid fa-${icon}"></i>
    </span>

    <span class="conversation-details">

        <strong>
            ${this.escapeHtml(title)}
        </strong>

        <small>
            ${this.escapeHtml(subtitle)}
        </small>

    </span>

    ${
        unreadCount > 0
            ? `
                <span class="conversation-unread-badge">
                    ${
                        unreadCount > 99
                            ? "99+"
                            : unreadCount
                    }
                </span>
              `
            : ""
    }
`;


        button.addEventListener(
            "click",
            () => {

                this.selectConversation(
                    conversation
                );
            }
        );


        return button;
    },


    /* =====================================================
       CONVERSATION TITLES
    ====================================================== */

    getConversationTitle(
        conversation
    ) {

        const participants =
            conversation.participants || [];


        if (
            conversation.type ===
            "PUBLIC_COUNCIL"
        ) {

            return "Public Council";
        }


        if (
            participants.length === 0
        ) {

            return conversation.type ===
                "PRIVATE_GROUP"
                ? "Private Group"
                : "Public Group";
        }


        const names =
            participants
                .map(
                    participant =>
                        participant.user?.fullName ||
                        participant.user?.username ||
                        "Delegate"
                )
                .slice(0, 3);


        const title =
            names.join(", ");


        if (
            participants.length > 3
        ) {

            return `${title} +${participants.length - 3}`;
        }


        return title;
    },


    getConversationSubtitle(
        conversation
    ) {

        const participants =
            conversation.participants || [];


        if (
            conversation.type ===
            "PUBLIC_GROUP"
        ) {

            if (
                participants.length === 0
            ) {

                return "Public group";
            }


            return `${participants.length} participant${
                participants.length === 1
                    ? ""
                    : "s"
            } · Everyone can view`;
        }


        if (
            conversation.type ===
            "PRIVATE_GROUP"
        ) {

            return `${participants.length} participant${
                participants.length === 1
                    ? ""
                    : "s"
            } · Private`;
        }


        return "Everyone in the council";
    },


    /* =====================================================
       SELECT CONVERSATION
    ====================================================== */

    async selectConversation(
        conversation
    ) {

        this.state.currentConversation =
            conversation;
        
        const conversationId =
    String(conversation.id);

this.state.unreadCounts[
    conversationId
] = 0;


        document
            .querySelectorAll(
                ".conversation-item"
            )
            .forEach(
                item => {

                    item.classList.toggle(
                        "active",
                        Number(
                            item.dataset.conversationId
                        ) ===
                        Number(
                            conversation.id
                        )
                    );
                }
            );


        this.renderConversationHeader(
            conversation
        );


        await this.loadMessages(
            conversation.id
        );
    },


    /* =====================================================
       CHAT HEADER
    ====================================================== */

    renderConversationHeader(
        conversation
    ) {

        const type =
            conversation.type;


        if (
            this.elements.conversationType
        ) {

            this.elements.conversationType
                .textContent =
                    this.formatConversationType(
                        type
                    );
        }


        if (
            this.elements.conversationTitle
        ) {

            this.elements.conversationTitle
                .textContent =
                    this.getConversationTitle(
                        conversation
                    );
        }


        if (
            this.elements.chatParticipantInfo
        ) {

            this.elements.chatParticipantInfo
                .innerHTML =
                    this.renderParticipantInfo(
                        conversation
                    );
        }


        if (
            this.elements.conversationTypeIcon
        ) {

            const icon =
                type === "PRIVATE_GROUP"
                    ? "lock"
                    : type === "PUBLIC_GROUP"
                        ? "users"
                        : "globe";


            this.elements.conversationTypeIcon
                .innerHTML = `
                    <i class="fa-solid fa-${icon}"></i>
                `;


            this.elements.conversationTypeIcon
                .className =
                    `chat-title-icon ${
                        type === "PRIVATE_GROUP"
                            ? "private"
                            : "public"
                    }`;
        }
    },


    formatConversationType(
        type
    ) {

        switch (type) {

            case "PUBLIC_COUNCIL":
                return "PUBLIC COUNCIL";

            case "PUBLIC_GROUP":
                return "PUBLIC GROUP";

            case "PRIVATE_GROUP":
                return "PRIVATE GROUP";

            default:
                return "CONVERSATION";
        }
    },


    renderParticipantInfo(
        conversation
    ) {

        if (
            conversation.type ===
            "PUBLIC_COUNCIL"
        ) {

            return `
                <i class="fa-solid fa-users"></i>
                <span>Council</span>
            `;
        }


        const count =
            conversation.participants?.length ||
            0;


        return `
            <i class="fa-solid fa-users"></i>
            <span>
                ${count}
                participant${count === 1 ? "" : "s"}
            </span>
        `;
    },
updateUnreadCount(conversationId) {

    if (!conversationId) {
        return;
    }

    const id = String(conversationId);

    this.state.unreadCounts[id] =
        (this.state.unreadCounts[id] || 0) + 1;

    this.renderConversationList();
},
async handleWebSocketEvent(event) {

    if (!event) {
        return;
    }

    const payload =
        event.payload || {};

    const conversationId =
        payload.conversationId ||
        event.payload;

    switch (event.type) {

        case "MESSAGE_SENT":

            if (!conversationId) {
                return;
            }

            /*
             * CHAIR / CO-CHAIR
             *
             * Oversight sees every diplomacy
             * conversation, so refresh the
             * oversight list.
             */
            if (
                this.state.role === "CHAIR" ||
                this.state.role === "CO_CHAIR"
            ) {

                await this.loadChairOversight();

                /*
                 * If the Chair is currently viewing
                 * this conversation, refresh its messages.
                 */
                if (
                    this.state.currentConversation &&
                    Number(
                        this.state.currentConversation.id
                    ) === Number(conversationId)
                ) {

                    await this.loadMessages(
                        conversationId
                    );
                }

                return;
            }

            /*
             * DELEGATE
             *
             * Refresh the currently open conversation
             * if this message belongs to it.
             */
            if (
                this.state.currentConversation &&
                Number(
                    this.state.currentConversation.id
                ) === Number(conversationId)
            ) {

                await this.loadMessages(
                    conversationId
                );

                return;
            }
            this.updateUnreadCount(
                    conversationId
                );


            /*
             * Message belongs to another conversation.
             * Refresh the sidebar.
             */


            await this.loadConversations();

            break;


        case "CONVERSATION_CREATED":

            /*
             * Chair oversight.
             */
            if (
                this.state.role === "CHAIR" ||
                this.state.role === "CO_CHAIR"
            ) {

                await this.loadChairOversight();

            }
            else {

                await this.loadConversations();

            }

            break;


        default:

            break;
    }
},


    /* =====================================================
       LOAD MESSAGES
    ====================================================== */

    async loadMessages(
        conversationId
    ) {

        if (!conversationId) {
            return;
        }


        this.showLoadingMessages();


        try {

const messages =
    await apiRequest(
        `/diplomacy/conversations/${conversationId}/messages`
    );


            this.state.messages =
                Array.isArray(messages)
                    ? messages
                    : [];


            console.log(
                `Messages for conversation ${conversationId}:`,
                this.state.messages
            );


            this.renderMessages();


        } catch (error) {

            console.error(
                "Unable to load diplomacy messages:",
                error
            );


            this.renderMessageError(
                this.getErrorMessage(error)
            );
        }
    },


    /* =====================================================
       RENDER MESSAGES
    ====================================================== */

    renderMessages() {

        const container =
            this.elements.messageList;


        if (!container) {
            return;
        }


        if (
            this.state.messages.length === 0
        ) {

            this.renderEmptyMessages();

            return;
        }


        container.innerHTML = "";


        this.state.messages.forEach(
            message => {

                container.appendChild(
                    this.createMessageElement(
                        message
                    )
                );
            }
        );


        container.scrollTop =
            container.scrollHeight;
    },


    createMessageElement(
        message
    ) {

        const element =
            document.createElement(
                "article"
            );


        element.className =
            "diplomacy-message";


        const sender =
            message.sender?.fullName ||
            message.sender?.username ||
            "Delegate";


        const content =
            message.content || "";


        const timestamp =
            this.formatDate(
                message.createdAt
            );


        element.innerHTML = `
            <div class="message-meta">

                <strong>
                    ${this.escapeHtml(sender)}
                </strong>

                <span>
                    ${this.escapeHtml(timestamp)}
                </span>

            </div>

            <div class="message-content">
                ${this.escapeHtml(content)}
            </div>
        `;


        return element;
    },


    renderEmptyMessages() {

        if (!this.elements.messageList) {
            return;
        }


        this.elements.messageList.innerHTML = `
            <div class="chat-empty-state">

                <div class="chat-empty-icon">
                    <i class="fa-solid fa-comments"></i>
                </div>

                <h3>
                    The floor is yours.
                </h3>

                <p>
                    Start the conversation.
                </p>

            </div>
        `;
    },


    showLoadingMessages() {

        if (!this.elements.messageList) {
            return;
        }


        this.elements.messageList.innerHTML = `
            <div class="chat-empty-state">

                <div class="chat-empty-icon">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                </div>

                <h3>
                    Loading conversation...
                </h3>

                <p>
                    Fetching messages.
                </p>

            </div>
        `;
    },


    renderMessageError(
        message
    ) {

        if (!this.elements.messageList) {
            return;
        }


        this.elements.messageList.innerHTML = `
            <div class="chat-empty-state">

                <div class="chat-empty-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>

                <h3>
                    Unable to load messages.
                </h3>

                <p>
                    ${this.escapeHtml(message)}
                </p>

            </div>
        `;
    },


    /* =====================================================
       COMPOSER
    ====================================================== */

    setupComposer() {

        const form =
            document.getElementById(
                "messageForm"
            );


        const input =
            document.getElementById(
                "messageInput"
            );


        const counter =
            document.getElementById(
                "messageCounter"
            );


        if (!form || !input) {
            return;
        }


        input.addEventListener(
            "input",
            () => {

                if (counter) {

                    counter.textContent =
                        `${input.value.length} / 2000`;
                }
            }
        );


        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await this.sendMessage();
            }
        );


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    form.requestSubmit();
                }
            }
        );
    },


    /* =====================================================
       SEND MESSAGE
    ====================================================== */

    async sendMessage() {

        /*
         * Chair is view-only.
         */

        if (
            this.state.role === "CHAIR" ||
            this.state.role === "CO_CHAIR"
        ) {

            return;
        }


        const conversation =
            this.state.currentConversation;


        if (!conversation) {

            this.showError(
                "Select a conversation first."
            );

            return;
        }


        const input =
            this.elements.messageInput;


        if (!input) {
            return;
        }


        const content =
            input.value.trim();


        if (!content) {
            return;
        }


        if (content.length > 2000) {

            this.showError(
                "Messages cannot exceed 2000 characters."
            );

            return;
        }


        const button =
            this.elements.sendMessageBtn;


        try {

            if (button) {
                button.disabled = true;
            }


await apiRequest(
    `/diplomacy/conversations/${conversation.id}/messages`,
    "POST",
    {
        content: content
    }
);


            input.value = "";


            if (
                this.elements.messageCounter
            ) {

                this.elements.messageCounter
                    .textContent =
                        "0 / 2000";
            }


            await this.loadMessages(
                conversation.id
            );


        } catch (error) {

            console.error(
                "Unable to send diplomacy message:",
                error
            );


            this.showError(
                this.getErrorMessage(error)
            );


        } finally {

            if (
                button &&
                this.state.role !== "CHAIR" &&
                this.state.role !== "CO_CHAIR"
            ) {

                button.disabled = false;
            }
        }
    },


    /* =====================================================
       NEW CONVERSATION
    ====================================================== */

setupNewConversationButton() {

    if (this.elements.newConversationBtn) {

        this.elements.newConversationBtn
            .addEventListener(
                "click",
                () => this.openNewConversation()
            );
    }


    if (this.elements.closeConversationModal) {

        this.elements.closeConversationModal
            .addEventListener(
                "click",
                () => this.closeNewConversation()
            );
    }


    if (this.elements.cancelConversationBtn) {

        this.elements.cancelConversationBtn
            .addEventListener(
                "click",
                () => this.closeNewConversation()
            );
    }


    if (this.elements.newConversationModal) {

        this.elements.newConversationModal
            .querySelector(
                "[data-close-modal]"
            )
            ?.addEventListener(
                "click",
                () => this.closeNewConversation()
            );
    }


    this.elements.conversationTypeOptions
        ?.forEach(option => {

            option.addEventListener(
                "click",
                () => {

                    this.selectConversationType(
                        option.dataset.conversationType
                    );
                }
            );
        });


    if (this.elements.participantSearch) {

        this.elements.participantSearch
            .addEventListener(
                "input",
                () => this.renderParticipantPicker()
            );
    }


    if (this.elements.createConversationBtn) {

        this.elements.createConversationBtn
            .addEventListener(
                "click",
                () => this.createNewConversation()
            );
    }
},


    openNewConversation() {

        /*
         * Participant picker comes in the next step.
         */

        console.log(
            "New diplomacy conversation requested."
        );


        this.showError(
            "Conversation creation will be added next."
        );
    },


    /* =====================================================
       UTILITY
    ====================================================== */

    formatDate(
        value
    ) {

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

            return "";
        }


        return date.toLocaleString(
            [],
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );
    },


    escapeHtml(
        value
    ) {

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


    getErrorMessage(
        error
    ) {

        if (
            error?.response?.data
        ) {

            return String(
                error.response.data
            );
        }


        return (
            error?.message ||
            "An unexpected error occurred."
        );
    },


    showError(
        message
    ) {

        console.error(
            "Diplomacy:",
            message
        );


        if (
            typeof DebateUtils !==
            "undefined" &&
            typeof DebateUtils.showToast ===
            "function"
        ) {

            DebateUtils.showToast(
                message
            );

            return;
        }


        if (
            typeof window.showToast ===
            "function"
        ) {

            window.showToast(
                message,
                "error"
            );

            return;
        }


        console.warn(
            message
        );
    },

    async openNewConversation() {

    if (
        this.state.role === "CHAIR" ||
        this.state.role === "CO_CHAIR"
    ) {

        return;
    }


    this.state.selectedParticipantIds = [];

    this.state.newConversationType =
        "PUBLIC_GROUP";


    this.updateConversationTypeUI();


    if (this.elements.participantSearch) {
        this.elements.participantSearch.value = "";
    }


    this.renderParticipantPicker();


    this.elements.newConversationModal.hidden =
        false;


    document.body.classList.add(
        "diplomacy-modal-open"
    );


    await this.loadDelegates();
},


closeNewConversation() {

    if (
        this.elements.newConversationModal
    ) {

        this.elements.newConversationModal.hidden =
            true;
    }


    document.body.classList.remove(
        "diplomacy-modal-open"
    );
},


selectConversationType(type) {

    if (
        type !== "PUBLIC_GROUP" &&
        type !== "PRIVATE_GROUP"
    ) {
        return;
    }


    this.state.newConversationType =
        type;


    this.updateConversationTypeUI();
},


updateConversationTypeUI() {

    this.elements.conversationTypeOptions
        ?.forEach(option => {

            option.classList.toggle(
                "active",
                option.dataset.conversationType ===
                    this.state.newConversationType
            );
        });
},


async loadDelegates() {

    const container =
        this.elements.participantList;


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="participant-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading delegates...
        </div>
    `;


    try {

const delegates =
    await apiRequest(
        `/diplomacy/session/${this.state.sessionId}/participants`
    );


        this.state.delegates =
            Array.isArray(delegates)
                ? delegates
                : [];


        /*
         * The logged-in delegate should not be selectable
         * because the backend automatically adds the creator.
         */

this.state.delegates =
    this.state.delegates.filter(
        registration => {

            return (
                registration.workflowStatus === "ACTIVE" &&
                Number(registration.userId) !==
                    Number(this.state.user?.id)
            );
        }
    );


        this.renderParticipantPicker();


    } catch (error) {

        console.error(
            "Failed to load delegates:",
            error
        );


        container.innerHTML = `
            <div class="no-participants">
                Unable to load delegates.
            </div>
        `;
    }
},


renderParticipantPicker() {

    const container =
        this.elements.participantList;


    if (!container) {
        return;
    }


    const search =
        (
            this.elements.participantSearch
                ?.value || ""
        )
        .trim()
        .toLowerCase();


    const delegates =
        this.state.delegates.filter(
            registration => {

                const name =
                    registration.user?.fullName ||
                    registration.delegateName ||
                    "";

                const username =
                    registration.user?.username ||
                    "";

                const character =
                    registration.characterName ||
                    registration.character?.name ||
                    "";


                const searchable =
                    `${name} ${username} ${character}`
                        .toLowerCase();


                return searchable.includes(
                    search
                );
            }
        );


    if (!delegates.length) {

        container.innerHTML = `
            <div class="no-participants">
                No matching delegates found.
            </div>
        `;

        this.updateSelectedParticipants();

        return;
    }


    container.innerHTML = "";


    delegates.forEach(
        registration => {

const registrationId =
    Number(
        registration.registrationId
    );


const name =
    registration.delegateName ||
    "Delegate";

const username =
    registration.email ||
    "";

const character =
    registration.characterName ||
    "Not Assigned";

            const selected =
                this.state.selectedParticipantIds
                    .includes(
                        registrationId
                    );


            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";


            button.className =
                `participant-option ${
                    selected
                        ? "selected"
                        : ""
                }`;


            button.innerHTML = `

                <span class="participant-avatar">
                    ${this.getInitials(name)}
                </span>

                <span class="participant-details">

                    <strong>
                        ${this.escapeHtml(name)}
                    </strong>

                    <small>
                        ${
                            this.escapeHtml(
                                character ||
                                username ||
                                "Delegate"
                            )
                        }
                    </small>

                </span>

                <span class="participant-check">

                    ${
                        selected
                            ? '<i class="fa-solid fa-check"></i>'
                            : ""
                    }

                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    this.toggleParticipant(
                        registrationId
                    );
                }
            );


            container.appendChild(
                button
            );
        }
    );


    this.updateSelectedParticipants();
},


toggleParticipant(
    registrationId
) {

    const index =
        this.state.selectedParticipantIds
            .indexOf(
                registrationId
            );


    if (index >= 0) {

        this.state.selectedParticipantIds
            .splice(
                index,
                1
            );

    } else {

        this.state.selectedParticipantIds
            .push(
                registrationId
            );
    }


    this.renderParticipantPicker();
},


updateSelectedParticipants() {

    const ids =
        this.state.selectedParticipantIds;


    if (
        this.elements.selectedParticipantCount
    ) {

        this.elements.selectedParticipantCount
            .textContent =
                `${ids.length} selected`;
    }


    if (
        this.elements.createConversationBtn
    ) {

        /*
         * Creator is automatically included.
         * Therefore at least one additional
         * participant is required.
         */

        this.elements.createConversationBtn
            .disabled =
                ids.length < 1;
    }


    if (
        !this.elements.selectedParticipants
    ) {
        return;
    }


    this.elements.selectedParticipants
        .innerHTML = "";


    ids.forEach(
        registrationId => {

            const registration =
                this.state.delegates.find(
                    item =>
                        Number(
                            item.registrationId ||
                            item.id
                        ) ===
                        Number(
                            registrationId
                        )
                );


            if (!registration) {
                return;
            }


const name =
    registration.delegateName ||
    "Delegate";

            const chip =
                document.createElement(
                    "span"
                );


            chip.className =
                "selected-participant-chip";


            chip.innerHTML = `
                ${this.escapeHtml(name)}

                <button
                    type="button"
                    aria-label="Remove ${this.escapeHtml(name)}"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;


            chip.querySelector(
                "button"
            ).addEventListener(
                "click",
                () => {

                    this.toggleParticipant(
                        Number(
                            registrationId
                        )
                    );
                }
            );


            this.elements.selectedParticipants
                .appendChild(
                    chip
                );
        }
    );
},


async createNewConversation() {

    if (
        this.state.selectedParticipantIds.length <
        1
    ) {

        this.showError(
            "Select at least one other delegate."
        );

        return;
    }


    if (!this.state.sessionId) {

        this.showError(
            "No active diplomacy session."
        );

        return;
    }


    const button =
        this.elements.createConversationBtn;


    try {

        if (button) {
            button.disabled = true;

            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Creating...
            `;
        }


        const conversation =
            await apiRequest(
                `/diplomacy/session/${this.state.sessionId}/conversations`,
                "POST",
                {
                    type:
                        this.state.newConversationType,

                    participantRegistrationIds:
                        this.state.selectedParticipantIds
                }
            );


        console.log(
            "Created diplomacy conversation:",
            conversation
        );


        this.closeNewConversation();


        /*
         * Reload the conversation list so the
         * new group appears immediately.
         */

        await this.loadConversations();


        /*
         * If the backend returns the created
         * conversation, open it directly.
         */

        if (
            conversation?.id
        ) {

            const created =
                this.state.conversations.find(
                    item =>
                        Number(item.id) ===
                        Number(conversation.id)
                );


            if (created) {

                await this.selectConversation(
                    created
                );
            }
        }


    } catch (error) {

        console.error(
            "Failed to create conversation:",
            error
        );


        this.showError(
            this.getErrorMessage(error)
        );


    } finally {

        if (button) {

            button.disabled =
                this.state.selectedParticipantIds
                    .length < 1;

            button.innerHTML = `
                <i class="fa-solid fa-plus"></i>
                Create Conversation
            `;
        }
    }
},


getInitials(
    name
) {

    return String(name || "D")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            part =>
                part.charAt(0)
                    .toUpperCase()
        )
        .join("");
},


async loadChairOversight() {

    if (
        this.state.role !== "CHAIR" &&
        this.state.role !== "CO_CHAIR"
    ) {
        return;
    }

    if (!this.state.sessionId) {
        return;
    }

    const container =
        this.elements.oversightConversationList;

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-conversations">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading council communications...
        </div>
    `;

    try {

        const conversations =
            await apiRequest(
                `/diplomacy/session/${this.state.sessionId}/chair/oversight`
            );

this.state.oversightConversations =
    Array.isArray(conversations)
        ? conversations
        : conversations
            ? [conversations]
            : [];

        console.log(
            "👁️ Chair oversight conversations:",
            this.state.oversightConversations
        );

        this.renderChairOversight();

    } catch (error) {

        console.error(
            "Failed to load chair oversight:",
            error
        );

        container.innerHTML = `
            <div class="empty-conversations">
                <i class="fa-solid fa-triangle-exclamation"></i>
                Unable to load council communications.
            </div>
        `;
    }
},

renderChairOversight() {

    const container =
        this.elements.oversightConversationList;

    if (!container) {
        return;
    }

    const conversations =
        this.state.oversightConversations || [];


    if (!conversations.length) {

        container.innerHTML = `
            <div class="empty-conversations">
                <i class="fa-solid fa-comments"></i>
                No conversations yet.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    conversations.forEach(
        conversation => {

            const item =
                document.createElement("button");

            item.type = "button";

            item.className =
                "oversight-conversation-item";


            if (
                this.state.currentConversation &&
                Number(
                    this.state.currentConversation.id
                ) === Number(conversation.id)
            ) {

                item.classList.add("active");
            }


            item.dataset.conversationId =
                conversation.id;


            const type =
                conversation.type;


            const participants =
                conversation.participants || [];


            let title = "Conversation";


            if (
                type === "PUBLIC_COUNCIL"
            ) {

                title = "Public Council";

            } else {

                const names =
                    participants
                        .map(
                            participant =>
                                participant.user?.fullName ||
                                participant.user?.username ||
                                "Delegate"
                        )
                        .filter(Boolean);


                if (names.length) {

                    title =
                        names
                            .slice(0, 3)
                            .join(", ");

                    if (names.length > 3) {

                        title +=
                            ` +${names.length - 3}`;
                    }

                } else {

                    title =
                        type === "PRIVATE_GROUP"
                            ? "Private Group"
                            : "Public Group";
                }
            }


            let icon =
                "landmark";


            if (
                type === "PUBLIC_GROUP"
            ) {

                icon = "users";

            } else if (
                type === "PRIVATE_GROUP"
            ) {

                icon = "lock";
            }


            const typeLabel =
                type === "PRIVATE_GROUP"
                    ? "PRIVATE GROUP"
                    : type === "PUBLIC_GROUP"
                        ? "PUBLIC GROUP"
                        : "PUBLIC COUNCIL";


            item.innerHTML = `

                <span class="oversight-conversation-icon">
                    <i class="fa-solid fa-${icon}"></i>
                </span>


                <span class="oversight-conversation-info">

                    <strong>
                        ${this.escapeHtml(title)}
                    </strong>

                    <small>
                        ${typeLabel}
                        ·
                        ${participants.length}
                        participant${
                            participants.length === 1
                                ? ""
                                : "s"
                        }
                    </small>

                </span>


                <span class="oversight-view-icon">
                    <i class="fa-solid fa-eye"></i>
                </span>

            `;


            item.addEventListener(
                "click",
                () => {

                    this.openOversightConversation(
                        conversation
                    );
                }
            );


            container.appendChild(item);
        }
    );
},
async openOversightConversation(
    conversation
) {

    if (
        this.state.role !== "CHAIR" &&
        this.state.role !== "CO_CHAIR"
    ) {
        return;
    }


    this.state.currentConversation =
        conversation;


    const conversationId =
    String(conversation.id);

this.state.unreadCounts[
    conversationId
] = 0;


    this.renderChairOversight();


    /*
     * Update the main conversation header.
     */
    this.renderConversationHeader(
        conversation
    );


    /*
     * Load messages through the
     * chair-only endpoint.
     */
    await this.loadOversightMessages(
        conversation.id
    );
},

async loadOversightMessages(
    conversationId
) {

    const container =
        this.elements.messageList;

    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="chat-empty-state">

            <div class="chat-empty-icon">
                <i class="fa-solid fa-spinner fa-spin"></i>
            </div>

            <h3>
                Loading communications...
            </h3>

            <p>
                Chair oversight · View only
            </p>

        </div>
    `;


    try {

        const messages =
            await apiRequest(
                `/diplomacy/conversations/${conversationId}/chair/messages`
            );


        this.state.messages =
            Array.isArray(messages)
                ? messages
                : [];


        this.renderMessages();


    } catch (error) {

        console.error(
            "Failed to load oversight messages:",
            error
        );


        container.innerHTML = `
            <div class="chat-empty-state">

                <div class="chat-empty-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>

                <h3>
                    Unable to load messages
                </h3>

                <p>
                    ${this.escapeHtml(
                        this.getErrorMessage(error)
                    )}
                </p>

            </div>
        `;
    }
},
};


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Diplomacy.init();

    }
);