const CommitteeAPI = {

    async getAll() {

        return apiRequest("/committees");

    }

};