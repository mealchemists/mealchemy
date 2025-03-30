import apiClient from './apiClient'

const LOGIN_URI = "login/";
const REGISTER_URI = "register/";
const LOGOUT_URI = "logout/";
const FORGOT_PASS_URI = "forgot-password/"
const UPDATE_ACCOUNT_URI = "update-account/"
const CSRF_URI = "csrf-token/"

// loginUser function to handle the login request
export const loginUser = async (creds) => {
    const csrfToken = await getCsrfToken();
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
    const csrfToken = await getCsrfToken();

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

    return csrfToken;
};

export const logout = async () =>{
    const csrfToken = await getCsrfToken();
    const response = await apiClient.post(LOGOUT_URI, "creds",
        {headers: {'X-CSRFToken': csrfToken}}
    );

    return response;
}

export const changePassword = async (creds) =>{
    const csrfToken = await getCsrfToken();
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

export const forgotPassword = async (username:object) =>{
    const csrfToken = await getCsrfToken();
    const response = await apiClient.post(FORGOT_PASS_URI, 
        username,
         {
            headers: {
                'X-CSRFToken': csrfToken, 
            }
        }
    );

    return response;
}