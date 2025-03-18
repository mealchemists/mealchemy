import axios from "axios";
import { handleAxiosError } from "./handleAxiosError.js"

const API_BASE_URL = "http://localhost:8000/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true
});

apiClient.interceptors.response.use(
  (response) => response,
);

export default apiClient;

