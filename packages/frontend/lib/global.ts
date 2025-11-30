import axios from "axios";

export const backendBase = "localhost:3010";
export const backendAPI = axios.create({ baseURL: `http://${backendBase}/v1` });
export const storageKey = "visual-logistics";
