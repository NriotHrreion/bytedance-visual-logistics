import axios from "axios";

export const amapAPIKey = process.env["NEXT_PUBLIC_AMAP_API_KEY"];
export const amapServiceKey = process.env["NEXT_PUBLIC_AMAP_SERVICE_KEY"];
export const amapRestAPI = axios.create({ baseURL: "https://restapi.amap.com" });
export const amapWebAPI = axios.create({ baseURL: "https://webapi.amap.com" });

export const backendAPI = axios.create({ baseURL: "http://localhost:3010/v1" });
