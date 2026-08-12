const Delegate = {

async loadCommittees(){

return await apiRequest(
"/committees"
);

},

async registerForCommittee(
committeeId,
characterId
){

return await apiRequest(
"/registrations",
"POST",
{
committeeId,
characterId
}
);

},

async submitResolution(
resolution
){

return await apiRequest(
"/resolutions",
"POST",
resolution
);

}

};