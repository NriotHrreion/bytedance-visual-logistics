import type { GeoLocation } from "types";
import { amapRestAPI, amapServiceKey } from "./global";

export async function getLocationName(location: GeoLocation): Promise<string> {
  const { data: res } = await amapRestAPI.get(`/v3/geocode/regeo?key=${amapServiceKey}&location=${location.join(",")}`);
  const address = res.regeocode.addressComponent;
  return `${address.province} ${address.city} ${address.district}`
}
