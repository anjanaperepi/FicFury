const Admin = {

async createCommittee(
committee
){

return await apiRequest(
"/committees",
"POST",
committee
);

},

async createCharacter(
character
){

return await apiRequest(
"/characters",
"POST",
character
);

},

async approveRegistration(
id
){

return await apiRequest(
`/registrations/${id}/approve`,
"PUT"
);

},

async getAnalytics(){

return await apiRequest(
"/analytics"
);

}

};