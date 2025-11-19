"use client";

import type { GeoLocation } from "types";
import useSWR from "swr";
import { getLocationName } from "@/lib/amap-api";

export function GeoLocationLabel({
  location,
  className,
  ...props
}: React.ComponentProps<"span"> & {
  location: GeoLocation
  className?: string
}) {
  const { data: locationName } = useSWR(
    `/regeo/${location ? location.join(",") : ""}`,
    () => location ? getLocationName(location) : null
  );
  return <span className={className} {...props}>{locationName}</span>;
}
