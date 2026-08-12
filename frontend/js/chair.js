const Chair = {

async approveResolution(id){

return await apiRequest(
`/resolutions/${id}/approve`,
"PUT"
);

},

async rejectResolution(id){

return await apiRequest(
`/resolutions/${id}/reject`,
"PUT"
);

},

async createCrisis(crisis){

return await apiRequest(
"/crises",
"POST",
crisis
);

}

};