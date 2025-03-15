import apiClient from './apiClient.js'

const LOGIN_URI = "login/";
const REGISTER_URI = "register/";
const CSRF_URI = "csrf-token/"

// loginUser function to handle the login request
export const loginUser = async (creds) => {
    // Fetch the CSRF token
    const csrfToken = await getCsrfToken();
    console.log(creds);

    // Make the POST request with the CSRF token in the headers
    const response = await apiClient.post(
        LOGIN_URI, 
        creds,
        // {
        //     headers: {
        //         'X-CSRFToken': csrfToken, // Include CSRF token in the header
        //     }
        // }
        );

    return response;
};

export const registerUser = async (creds) =>
{
    // Fetch the CSRF token
    const csrfToken = await getCsrfToken();
    console.log(creds);

    // Make the POST request with the CSRF token in the headers
    const response = await apiClient.post(
        REGISTER_URI, 
        creds,
        // {
        //     headers: {
        //         'X-CSRFToken': csrfToken, // Include CSRF token in the header
        //     }
        // }
        );

    return response;
}

export const getCsrfToken = async () => {
    const response = await apiClient.get(CSRF_URI, { withCredentials: true });  // Ensure cookies are set
    const csrfToken = response.data.csrf_token;

    // Set default CSRF token for all future requests
    // apiClient.defaults.headers.common["X-CSRFToken"] = csrfToken;

    return csrfToken;
};
