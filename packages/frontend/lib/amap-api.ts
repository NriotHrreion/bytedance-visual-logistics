import type { GeoLocation } from "types";
import axios from "axios";
import { amapRestAPIBase, amapServiceKey, amapWebAPIBase } from "./global";

const restAPI = axios.create({ baseURL: "https://"+ amapRestAPIBase });
const webAPI = axios.create({ baseURL: "https://"+ amapWebAPIBase });

export async function getLocationName(location: GeoLocation): Promise<string> {
  const { data: res } = await restAPI.get(`/v3/geocode/regeo?key=${amapServiceKey}&location=${location.join(",")}`);
  const address = res.regeocode.addressComponent;
  return `${address.province} ${address.city} ${address.district}`
}
