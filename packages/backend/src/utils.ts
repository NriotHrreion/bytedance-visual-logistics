import { GeoLocation } from "types";

export function getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for(let i = 0; i < length; i++) {
    result += chars[getRandom(0, chars.length - 1)];
  }
  return result;
}

export function deserializeGeoLocation(locationStr: string): GeoLocation {
  return locationStr.replace("(", "").replace(")", "").split(",").map(parseFloat) as GeoLocation;
}

export function serializeGeoLocation(location: GeoLocation): string {
  return `(${location[0]},${location[1]})`;
}
