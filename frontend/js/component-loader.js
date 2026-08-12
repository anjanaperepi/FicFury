/* ==========================================================
   FIC FURY
   Component Loader
========================================================== */
document.addEventListener("DOMContentLoaded", async () => {

    await loader.load(
        "sidebar",
        "../components/sidebar.html"
    );

    await loader.load(
        "topbar",
        "../components/topbar.html"
    );

    const footer = document.getElementById("footer");

    if (footer) {

        await loader.load(
            "footer",
            "../components/footer.html"
        );

    }

    if (typeof initializeSidebar === "function") {

        initializeSidebar();

    }

});


class ComponentLoader {

    async load(id, file) {

    try {

        const container = document.getElementById(id);

        if (!container) {

            console.warn(
                `Component container '${id}' not found. Skipping ${file}.`
            );

            return;

        }

        const response = await fetch(file);

        if (!response.ok) {

            throw new Error(
                `Failed to load ${file}`
            );

        }

        const html = await response.text();

        container.innerHTML = html;

    }

    catch (error) {

        console.error(
            `Error loading component '${file}':`,
            error
        );

    }
}
}



const loader = new ComponentLoader();




  



/* ==========================================================
   LOGOUT
========================================================== */

document.addEventListener(

    "click",

    function(event){

        if(event.target.closest("#logoutBtn")){

            localStorage.clear();

            window.location.href=

                "login.html";

        }

    }


);
