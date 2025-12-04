import "@amap/amap-jsapi-types";
import { amapAPIKey, type GeoLocation } from "shared";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AMapLoader from "@amap/amap-jsapi-loader";

const AUTO_CENTER_AFTER_MOVING_MS = 2000;

interface PolylineProperties {
  points: GeoLocation[]
  color: string
}

export default function AMapContainer({
  width,
  height,
  location,
  autoCentered = false,
  zoom = 14,
  markable = false,
  polylines = [],
  indicator = false,
  indicatorContent,
  indicatorOffset,
  onMark,
  ref
}: {
  width?: number
  height?: number
  location?: GeoLocation
  autoCentered?: boolean
  zoom?: number
  markable?: boolean
  polylines?: PolylineProperties[]
  indicator?: boolean
  indicatorContent?: React.ReactNode
  indicatorOffset?: [number, number]
  onMark?: (location: GeoLocation) => void
  ref?: React.RefObject<AMap.Map | null>
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<typeof AMap | null>(null);
  const _mapRef = useRef<AMap.Map | null>(null);
  const mapRef = ref ?? _mapRef;
  const markerRef = useRef<AMap.Marker | null>(null);
  const indicatorRef = useRef<AMap.Marker | null>(null);
  const polylinesRef = useRef<AMap.Polyline[]>([]);
  const [isMoving, setMoving] = useState(false);
  const dragEndTimerRef = useRef<NodeJS.Timeout | null>(null);
  const zoomEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  const putMarker = (at: GeoLocation) => {
    if(!instanceRef.current || !mapRef.current) return;

    if(markerRef.current) {
      markerRef.current.setPosition(at);
      return;
    }

    markerRef.current = new instanceRef.current.Marker({
      position: at,
      content: renderToStaticMarkup(
        <img
          width={26}
          height={60}
          src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png"
          alt="amap-marker"/>
      ),
      offset: new instanceRef.current.Pixel(-13, -30),
    });
    mapRef.current.add(markerRef.current);
  };

  const drawPolyline = useCallback((polyline: GeoLocation[], color: string) => {
    if(!instanceRef.current || !mapRef.current || polyline.length === 0) return;
    
    const path = polyline.map((location) => new instanceRef.current.LngLat(location[0], location[1]));
    const polylineInstance = new instanceRef.current.Polyline({
      path,
      strokeColor: color,
      strokeWeight: 4,
      strokeOpacity: 0.8
    });
    
    polylinesRef.current.push(polylineInstance);
    mapRef.current.add(polylineInstance);
  }, [mapRef]);

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
        center: location ?? [116.397428, 39.90923], // 北京市
        mapStyle: "amap://styles/whitesmoke"
      });

      mapRef.current.on("dragstart", () => {
        setMoving(true);
        dragEndTimerRef.current && clearTimeout(dragEndTimerRef.current);
      });
      mapRef.current.on("dragend", () => {
        dragEndTimerRef.current = setTimeout(() => setMoving(false), AUTO_CENTER_AFTER_MOVING_MS);
      });
      mapRef.current.on("zoomstart", () => {
        setMoving(true);
        zoomEndTimerRef.current && clearTimeout(zoomEndTimerRef.current);
      });
      mapRef.current.on("zoomend", () => {
        zoomEndTimerRef.current = setTimeout(() => setMoving(false), AUTO_CENTER_AFTER_MOVING_MS);
      });

      if(markable) {
        if(location) putMarker(location);

        mapRef.current.on("click", (e) => {
          const markedLocation: GeoLocation = [e.lnglat.lng, e.lnglat.lat];
          onMark && onMark(markedLocation);
          putMarker(markedLocation);
        });
      }

      polylines.forEach(({ points, color }) => drawPolyline(points, color));

      if(indicator && location) {
        indicatorRef.current = new instanceRef.current.Marker({
          position: location,
          content: renderToStaticMarkup(indicatorContent),
          offset: new instanceRef.current.Pixel(...indicatorOffset),
        });
        mapRef.current.add(indicatorRef.current);
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

    return () => {
      mapRef.current?.destroy();
      dragEndTimerRef.current && clearTimeout(dragEndTimerRef.current);
      zoomEndTimerRef.current && clearTimeout(zoomEndTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(!mapRef.current) return;

    polylinesRef.current.forEach((polyline) => mapRef.current.remove(polyline));
    polylinesRef.current = [];
    polylines.forEach(({ points, color }) => drawPolyline(points, color));
  }, [polylines, mapRef, drawPolyline]);

  useEffect(() => {
    if(!mapRef.current || !location) return;

    if(autoCentered && !isMoving) {
      mapRef.current.setCenter(location);
    }
    if(indicator && indicatorRef.current) {
      indicatorRef.current.setPosition(location);
    }
  }, [autoCentered, indicator, location, isMoving, mapRef]);

  return <div ref={containerRef} style={{ width, height }}/>;
}
