document
    .getElementById(
        "delegateRegistrationForm"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const user =
                JSON.parse(
                    localStorage.getItem(
                        CONFIG.USER_KEY
                    )
                );

            const data = {

                userId:
                    user.id,

                committeeId:
                    parseInt(
                        document.getElementById(
                            "committee"
                        ).value
                    ),

                characterId:
                    parseInt(
                        document.getElementById(
                            "character"
                        ).value
                    )

            };

            try {

                const response =
                    await fetch(

                        `${CONFIG.API_BASE_URL}/registrations/register`,

                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                "application/json"
                            },

                            body:
                            JSON.stringify(data)

                        }

                    );

                if(response.ok){

                    window.location.href =
                        "registration-success.html";

                }
                else {

                    alert(
                        "Registration failed"
                    );

                }

            }
            catch(error){

                console.error(error);

                alert(
                    "Error creating registration"
                );

            }

        }
    );