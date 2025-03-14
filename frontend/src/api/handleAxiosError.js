// TODO: maybe we can delete this I was trying to make global errors for axios but not sure if this is useful
export const handleAxiosError = (error) => {
  if (error.response) {
    // Server responded with a status other than 2xx
    console.error('Response error:', error.response);
    return {
      status: error.response.status,
      message: error.response.data.message || 'An error occurred.',
    };
  } else if (error.request) {
    // No response was received
    console.error('Request error:', error.request);
    return { status: 0, message: 'No response from server.' };
  } else {
    console.error('Error:', error.message);
    return { status: 0, message: 'An error occurred during the request.' };
  }
};

