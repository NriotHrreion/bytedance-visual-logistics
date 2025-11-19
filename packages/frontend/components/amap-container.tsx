import "@amap/amap-jsapi-types";
import type { GeoLocation } from "types";
import { useEffect, useRef } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import { amapAPIKey } from "@/lib/global";

export default function AMapContainer({
  width,
  height,
  location = [116.397428, 39.90923],
  zoom = 10
}: {
  width?: number
  height?: number
  location?: GeoLocation
  zoom?: number
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<AMap.Map | null>(null);

  useEffect(() => {
    if(!containerRef.current) return;

    (window as any)["_AMapSecurityConfig"] = {
      serviceHost: `${window.location.origin}/_AMapService`
    };

    AMapLoader.load({
      key: amapAPIKey,
      version: "2.0",
      plugins: ["AMap.Scale"]
    }).then((AMap) => {
      mapRef.current = new AMap.Map(containerRef.current, {
        viewMode: "3D",
        zoom,
        center: location
      });
    }).catch((e) => console.log(e));

    return () => mapRef.current.destroy();
  }, [location, zoom]);

  return <div ref={containerRef} style={{ width, height }}/>;
}
