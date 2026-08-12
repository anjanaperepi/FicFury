/**
 * ============================================================
 * Delegate API Service
 * All Registration-related backend communication lives here.
 * ============================================================
 */

const DelegateAPI = {

    /* ------------------------------------------------------ */
    /* Retrieval                                               */
    /* ------------------------------------------------------ */

    async getAll() {
        return apiRequest("/registrations");
    },

    async getChairDelegates() {
        return apiRequest("/registrations/chair");
    },

    async getPendingChairDelegates() {
        return apiRequest("/registrations/pending-chair");
    },

    async getUserRegistrations(userId) {
        return apiRequest(`/registrations/user/${userId}`);
    },

    async getCompleted() {
        return apiRequest("/registrations/completed");
    },

    async getRejected() {
        return apiRequest("/registrations/rejected");
    },

    async getActive() {
        return apiRequest("/registrations/active");
    },

    /* ------------------------------------------------------ */
    /* Admin                                                   */
    /* ------------------------------------------------------ */

    async adminApprove(id) {

        return apiRequest(

            `/registrations/${id}/approve`,

            "PUT",

            {}

        );

    },

    async adminReject(id, reason) {

        return apiRequest(

            `/registrations/${id}/reject`,

            "PUT",

            {
                reason
            }

        );

    },

    /* ------------------------------------------------------ */
    /* Chair                                                   */
    /* ------------------------------------------------------ */

    async chairApprove(id) {

        return apiRequest(

            `/registrations/${id}/chair-approve`,

            "PUT"

        );

    },

    async chairReject(id, reason) {

        return apiRequest(

            `/registrations/${id}/chair-reject`,

            "PUT",

            {
                reason
            }

        );

    },

    async complete(id) {

        return apiRequest(

            `/registrations/${id}/complete`,

            "PUT"

        );

    },

    /* ------------------------------------------------------ */
    /* CRUD                                                    */
    /* ------------------------------------------------------ */

    async update(id, payload) {

        return apiRequest(

            `/registrations/${id}`,

            "PUT",

            payload

        );

    },

    async remove(id) {

        return apiRequest(

            `/registrations/${id}`,

            "DELETE"

        );

    }

};
