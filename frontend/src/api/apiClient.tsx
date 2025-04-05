import axios from "axios";
import { handleAxiosError } from "./handleAxiosError.js"

axios.defaults.withCredentials = true; 
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api" 

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true
});

apiClient.interceptors.response.use(
  (response) => response,
);

export default apiClient;
