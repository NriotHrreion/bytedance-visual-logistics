import type { GeoLocation } from "./types";

/** @returns km */
export function getSegmentDistance(from: GeoLocation, to: GeoLocation): number {
  const [lon1, lat1] = from;
  const [lon2, lat2] = to;

  const avgLat = (lat1 + lat2) / 2;
  const latDiff = lat2 - lat1;
  const lonDiff = lon2 - lon1;

  const latDistance = latDiff * 111;
  const lonDistance = lonDiff * 111 * Math.cos(avgLat * Math.PI / 180);

  return Math.sqrt(latDistance ** 2 + lonDistance ** 2);
}
