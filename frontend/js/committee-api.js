async function loadCommittees() {

    try {

        const response =
            await fetch(
                `${CONFIG.API_BASE_URL}/committees`
            );

        const committees =
            await response.json();

        const dropdown =
            document.getElementById(
                "committee"
            );

        dropdown.innerHTML =
            '<option value="">Select Committee</option>';

        committees.forEach(
            committee => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    committee.id;

                option.textContent =
                    committee.name;

                dropdown.appendChild(
                    option
                );

            }
        );

    }
    catch(error){

        console.error(
            "Failed to load committees",
            error
        );

    }

}
document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCommittees();

        document
            .getElementById(
                "committee"
            )
            .addEventListener(
                "change",
                function() {

                    const committeeId =
                        this.value;

                    if(
                        committeeId
                    ){

                        loadCharacters(
                            committeeId
                        );

                    }

                }
            );

    }
);