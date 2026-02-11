import axios from "axios";

console.log(import.meta.env.VITE_API_URL);
const userApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/',
});

export default userApi;