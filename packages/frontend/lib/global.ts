import axios from "axios";

export const backendAPI = axios.create({ baseURL: "http://localhost:3010/v1" });
export const storageKey = "visual-logistics";
