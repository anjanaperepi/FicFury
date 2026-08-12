const DebateAPI = {

    async request(endpoint, options = {}) {

        const token = localStorage.getItem(CONFIG.TOKEN_KEY);

        const response = await fetch(

            `${CONFIG.API_BASE_URL}${endpoint}`,

            {

                ...options,

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`,

                    ...(options.headers || {})

                }

            }

        );

        if (!response.ok) {

            const message = await response.text();

            throw new Error(message || "API request failed.");

        }

        if (response.status === 204) {

            return null;

        }

        return await response.json();

    },



    get(endpoint) {

        return this.request(endpoint);

    },



    post(endpoint, body) {

        return this.request(endpoint, {

            method: "POST",

            body: JSON.stringify(body)

        });

    },



    put(endpoint, body) {

        return this.request(endpoint, {

            method: "PUT",

            body: JSON.stringify(body)

        });

    },



    delete(endpoint) {

        return this.request(endpoint, {

            method: "DELETE"

        });

    }

};