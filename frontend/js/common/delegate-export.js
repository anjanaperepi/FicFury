function exportDelegates(){

    if(!DelegateApp.filteredDelegates.length){

        showToast(

            "Nothing to export",

            "error"

        );

        return;

    }

    const rows=[];

    rows.push([

        "Delegate",

        "Email",

        "Committee",

        "Character",

        "Workflow"

    ]);

    DelegateApp.filteredDelegates.forEach(d=>{

        rows.push([

            d.user?.fullName,

            d.user?.email,

            d.committee?.name,

            d.character?.name,

            d.workflowStatus

        ]);

    });

    const csv=

        rows

        .map(r=>r.join(","))

        .join("\n");

    const blob=new Blob(

        [csv],

        {

            type:"text/csv"

        }

    );

    const url=

        URL.createObjectURL(blob);

    const a=

        document.createElement("a");

    a.href=url;

    a.download="delegates.csv";

    a.click();

    URL.revokeObjectURL(url);

}