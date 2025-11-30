import "@amap/amap-jsapi-types";
import { amapAPIKey, type GeoLocation } from "shared";
import { useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AMapLoader from "@amap/amap-jsapi-loader";

export default function AMapContainer({
  width,
  height,
  location,
  zoom = 14,
  markable = false,
  polyline = [],
  onMark
}: {
  width?: number
  height?: number
  location?: GeoLocation
  zoom?: number
  markable?: boolean
  polyline?: GeoLocation[]
  onMark?: (location: GeoLocation) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<typeof AMap | null>(null);
  const mapRef = useRef<AMap.Map | null>(null);
  const markerRef = useRef<AMap.Marker | null>(null);
  const polylineRef = useRef<AMap.Polyline | null>(null);

  function putMarker(at: GeoLocation) {
    if(!instanceRef.current || !mapRef.current) return;

    if(markerRef.current) {
      markerRef.current.setPosition(at);
      return;
    }

    markerRef.current = new instanceRef.current.Marker({
      position: at,
      content: renderToStaticMarkup(
        <div>
          <img
            width={26}
            height={60}
            src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png"
            alt="amap-marker"/>
        </div>
      ),
      offset: new instanceRef.current.Pixel(-13, -30),
    });
    mapRef.current.add(markerRef.current);
  }

  function drawPolyline(polyline: GeoLocation[]) {
    if(!instanceRef.current || !mapRef.current || polyline.length === 0) return;
    
    const path = polyline.map((location) => new instanceRef.current.LngLat(location[0], location[1]));
    const polylineInstance = new instanceRef.current.Polyline({
      path,
      strokeColor: "red",
      strokeWeight: 6,
      strokeOpacity: 0.8
    });
    
    if(polylineRef.current) {
      mapRef.current.remove(polylineRef.current);
    }
    polylineRef.current = polylineInstance;
    mapRef.current.add(polylineInstance);
  }

  const initMap = async () => {
    try {
      instanceRef.current = await AMapLoader.load({
        key: amapAPIKey,
        version: "2.0",
        plugins: ["AMap.Scale"]
      });

      mapRef.current = new instanceRef.current.Map(containerRef.current, {
        viewMode: "3D",
        zoom,
        center: location ?? [116.397428, 39.90923] // 北京市
      });

      if(markable) {
        if(location) putMarker(location);

        mapRef.current.on("click", (e) => {
          const markedLocation: GeoLocation = [e.lnglat.lng, e.lnglat.lat];
          onMark && onMark(markedLocation);
          putMarker(markedLocation);
        });
      }

      if(polyline) {
        drawPolyline(polyline);
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

  useEffect(() => {
    if(!mapRef.current || !location) return;

    mapRef.current.setCenter(location);
  }, [location]);

  useEffect(() => {
    drawPolyline(polyline);
  }, [polyline]);

  return <div ref={containerRef} style={{ width, height }}/>;
}
