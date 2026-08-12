const CharacterAPI = {

    async getAll() {

        return apiRequest("/characters");

    }

};