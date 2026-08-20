async function apiRequest(
    endpoint,
    method = "GET",
    data = null,
    isMultipart = false
) {

    const token = localStorage.getItem(CONFIG.TOKEN_KEY);

    const options = {
        method,
        headers: {}
    };

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {

        if (isMultipart) {

            // Let the browser set multipart boundaries
            options.body = data;

        } else {

            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(data);

        }

    }

    try {

        const response = await fetch(
            `${CONFIG.API_BASE_URL}${endpoint}`,
            options
        );

        if (response.status === 204) {
            return null;
        }

        let responseData = null;

        try {
            responseData = await response.json();
        } catch {
            responseData = null;
        }
if (!response.ok) {


            const message =
                responseData?.message ||
                responseData?.error ||
                response.statusText ||
                `HTTP ${response.status}`;

            throw new Error(message);

        }

        return responseData;

    } catch (error) {

        console.error(error);

        Utils.showToast(
            error.message || "Server Error",
            "error"
        );

        throw error;

    }

}