async function loadCommittees(){

const committees =
await apiRequest("/committees");

renderCommittees(committees);

}