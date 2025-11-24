import "@amap/amap-jsapi-types";
import type { GeoLocation } from "types";
import { useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AMapLoader from "@amap/amap-jsapi-loader";
import { amapAPIKey } from "@/lib/global";

export default function AMapContainer({
  width,
  height,
  location = [116.397428, 39.90923],
  zoom = 10,
  markable = false,
  onMark
}: {
  width?: number
  height?: number
  location?: GeoLocation
  zoom?: number
  markable?: boolean
  onMark?: (location: GeoLocation) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<AMap.Map | null>(null);
  const markerRef = useRef<AMap.Marker | null>(null);

  const initMap = async () => {
    try {
      const amap = await AMapLoader.load({
        key: amapAPIKey,
        version: "2.0",
        plugins: ["AMap.Scale"]
      });

      mapRef.current = new amap.Map(containerRef.current, {
        viewMode: "3D",
        zoom,
        center: location
      });

      if(markable) {
        mapRef.current.on("click", (e) => {
          const markedLocation: GeoLocation = [e.lnglat.lng, e.lnglat.lat];
          onMark && onMark(markedLocation);

          if(markerRef.current) {
            markerRef.current.setPosition(markedLocation);
            return;
          }

          markerRef.current = new amap.Marker({
            position: markedLocation,
            content: renderToStaticMarkup(
              <div>
                <img
                  width={26}
                  height={60}
                  src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png"
                  alt="amap-marker"/>
              </div>
            ),
            offset: new amap.Pixel(-13, -30),
          });
          mapRef.current?.add(markerRef.current);
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if(!containerRef.current) return;

    (window as any)["_AMapSecurityConfig"] = {
      serviceHost: `${window.location.origin}/_AMapService`
    };

    initMap();

    return () => mapRef.current?.destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} style={{ width, height }}/>;
}
