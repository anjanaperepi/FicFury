document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!Auth.isLoggedIn()) {

            window.location.href =
                "../login.html";

            return;

        }

        await loadSettings();

    }
);


// ==========================
// LOAD SETTINGS
// ==========================

async function loadSettings() {

    try {

        const settings =
            await apiRequest(
                "/settings"
            );

        // Branding

        setValue(
            "platformName",
            settings.platformName
        );

        setValue(
            "platformTagline",
            settings.platformTagline
        );

        setValue(
            "themeColor",
            settings.themeColor
        );

        // Event

        setValue(
            "eventName",
            settings.eventName
        );

        setValue(
            "eventDate",
            settings.eventDate
        );

        setValue(
            "eventTime",
            settings.eventTime
        );

        setValue(
            "registrationStatus",
            settings.registrationStatus
        );

        // Email Templates

        setValue(
            "registrationTemplate",
            settings.registrationTemplate
        );

        setValue(
            "certificateTemplate",
            settings.certificateTemplate
        );

        // Security

        setChecked(
            "twoFactor",
            settings.twoFactor
        );

        setChecked(
            "loginNotifications",
            settings.loginNotifications
        );

        setChecked(
            "publicProfiles",
            settings.publicProfiles
        );

        setChecked(
            "auditLogs",
            settings.auditLogs
        );

        // Notifications

        setChecked(
            "emailNotifications",
            settings.emailNotifications
        );

        setChecked(
            "committeeAlerts",
            settings.committeeAlerts
        );

        setChecked(
            "crisisNotifications",
            settings.crisisNotifications
        );

        setChecked(
            "marketingUpdates",
            settings.marketingUpdates
        );

        // Integrations

        setValue(
            "googleMeetKey",
            settings.googleMeetKey
        );

        setValue(
            "discordWebhook",
            settings.discordWebhook
        );

        setValue(
            "emailApiKey",
            settings.emailApiKey
        );

        setValue(
            "cloudStorageKey",
            settings.cloudStorageKey
        );

    }
    catch(error){

        console.error(error);

    }

}


// ==========================
// SAVE SETTINGS
// ==========================

async function saveSettings() {

    try {

        const settings = {

            platformName:
                getValue(
                    "platformName"
                ),

            platformTagline:
                getValue(
                    "platformTagline"
                ),

            themeColor:
                getValue(
                    "themeColor"
                ),

            eventName:
                getValue(
                    "eventName"
                ),

            eventDate:
                getValue(
                    "eventDate"
                ),

            eventTime:
                getValue(
                    "eventTime"
                ),

            registrationStatus:
                getValue(
                    "registrationStatus"
                ),

            registrationTemplate:
                getValue(
                    "registrationTemplate"
                ),

            certificateTemplate:
                getValue(
                    "certificateTemplate"
                ),

            twoFactor:
                getChecked(
                    "twoFactor"
                ),

            loginNotifications:
                getChecked(
                    "loginNotifications"
                ),

            publicProfiles:
                getChecked(
                    "publicProfiles"
                ),

            auditLogs:
                getChecked(
                    "auditLogs"
                ),

            emailNotifications:
                getChecked(
                    "emailNotifications"
                ),

            committeeAlerts:
                getChecked(
                    "committeeAlerts"
                ),

            crisisNotifications:
                getChecked(
                    "crisisNotifications"
                ),

            marketingUpdates:
                getChecked(
                    "marketingUpdates"
                ),

            googleMeetKey:
                getValue(
                    "googleMeetKey"
                ),

            discordWebhook:
                getValue(
                    "discordWebhook"
                ),

            emailApiKey:
                getValue(
                    "emailApiKey"
                ),

            cloudStorageKey:
                getValue(
                    "cloudStorageKey"
                )

        };

        await apiRequest(
            "/settings",
            "PUT",
            settings
        );

        alert(
            "Settings Saved Successfully"
        );

    }
    catch(error){

        console.error(error);

        alert(
            "Unable to save settings."
        );

    }

}


// ==========================
// HELPERS
// ==========================

function getValue(id) {

    return document
        .getElementById(id)
        ?.value || "";

}

function setValue(id,value) {

    const element =
        document.getElementById(id);

    if(element){

        element.value =
            value || "";

    }

}

function getChecked(id) {

    return document
        .getElementById(id)
        ?.checked || false;

}

function setChecked(id,value) {

    const element =
        document.getElementById(id);

    if(element){

        element.checked =
            value || false;

    }

}