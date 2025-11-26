import type { GeoLocation } from "types";
import { useEffect, useState } from "react";
import { getLocationName } from "@/lib/amap-api";

export function useLocationName(loc: GeoLocation | null) {
  const [location, setLocation] = useState<GeoLocation | null>(loc);
  const [locationName, setLocationName] = useState<string>("");
  
  useEffect(() => {
    if(!location) return;

    getLocationName(location).then(setLocationName);
  }, [location]);

  return { location, setLocation, locationName };
}
