async function loadCharacters(
    committeeId
) {

    try {

        const response =
            await fetch(

                `${CONFIG.API_BASE_URL}/characters/committee/${committeeId}`

            );

        const characters =
            await response.json();

        const dropdown =
            document.getElementById(
                "character"
            );

        dropdown.innerHTML =
            '<option value="">Select Character</option>';

        characters.forEach(
            character => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    character.id;

                option.textContent =
                    `${character.name} (${character.title})`;

                dropdown.appendChild(
                    option
                );

            }
        );

    }
    catch(error){

        console.error(
            error
        );

    }

}