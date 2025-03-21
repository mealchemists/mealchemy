import apiClient from './apiClient'

const LOGIN_URI = "login/";
const REGISTER_URI = "register/";
const LOGOUT_URI = "logout/";
const FORGOT_PASS_URI = "forgot-password/"
const UPDATE_ACCOUNT_URI = "update-account/"
const CSRF_URI = "csrf-token/"

// loginUser function to handle the login request
export const loginUser = async (creds) => {
    // Fetch the CSRF token
    const csrfToken = await getCsrfToken();
    // Make the POST request with the CSRF token in the headers
    const response = await apiClient.post(
        LOGIN_URI, 
        creds,
        {
            headers: {
                'X-CSRFToken': csrfToken, // Include CSRF token in the header
            }
        }
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
        {
            headers: {
                'X-CSRFToken': csrfToken, // Include CSRF token in the header
            }
        }
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

export const logout = async () =>{
    const csrfToken = await getCsrfToken();
    const response = await apiClient.post(LOGOUT_URI, "creds",
         {
            headers: {
                'X-CSRFToken': csrfToken, 
            }
        }
    );

    return response;
}

export const changePassword = async (username:string, password:string) =>{
    const csrfToken = await getCsrfToken();
    const creds = {
        "username": username,
        "password":password
    }
    const response = await apiClient.post(UPDATE_ACCOUNT_URI, 
        creds,
         {
            headers: {
                'X-CSRFToken': csrfToken, 
            }
        }
    );

    return response;
}