import "@amap/amap-jsapi-types";
import { amapAPIKey, type GeoLocation } from "shared";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AMapLoader from "@amap/amap-jsapi-loader";

const AUTO_CENTER_AFTER_MOVING_MS = 2000;

interface PolylineProperties {
  readonly key: string
  points: GeoLocation[]
  color: string
}

interface MarkerProperties {
  readonly key: string
  location: GeoLocation
  content: React.ReactNode
  offset: [number, number]
  hidden?: boolean
}

export default function AMapContainer({
  width,
  height,
  location = [116.397428, 39.90923], // 北京市
  autoCenteringRange,
  zoom = 14,
  markable = false,
  polylines = [],
  markers = [],
  onMark,
  ref
}: {
  width?: number
  height?: number
  location?: GeoLocation
  autoCenteringRange?: number
  zoom?: number
  markable?: boolean
  polylines?: PolylineProperties[]
  markers?: MarkerProperties[]
  onMark?: (location: GeoLocation) => void
  ref?: React.RefObject<AMap.Map | null>
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<typeof AMap | null>(null);
  const _mapRef = useRef<AMap.Map | null>(null);
  const mapRef = ref ?? _mapRef;
  const markerInputRef = useRef<AMap.Marker | null>(null);
  const [isMapLoaded, setMapLoaded] = useState(false);
  const polylinesRef = useRef<Map<string, AMap.Polyline>>(new Map());
  const markersRef = useRef<Map<string, AMap.Marker>>(new Map());
  const [isMoving, setMoving] = useState(false);
  const dragEndTimerRef = useRef<NodeJS.Timeout | null>(null);
  const zoomEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  const putMarker = (at: GeoLocation) => {
    if(!instanceRef.current || !mapRef.current) return;

    if(markerInputRef.current) {
      markerInputRef.current.setPosition(at);
      return;
    }

    markerInputRef.current = new instanceRef.current.Marker({
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
    mapRef.current.add(markerInputRef.current);
  };

  const drawPolyline = useCallback((polyline: PolylineProperties) => {
    if(!instanceRef.current || !mapRef.current || polyline.points.length === 0) return;

    const path = polyline.points.map((location) => new instanceRef.current.LngLat(location[0], location[1]));
    if(polylinesRef.current.has(polyline.key)) {
      polylinesRef.current.get(polyline.key)?.setPath(path);
      return;
    }

    const polylineInstance = new instanceRef.current.Polyline({
      path,
      strokeColor: polyline.color,
      strokeWeight: 4,
      strokeOpacity: 0.8
    });

    polylinesRef.current.set(polyline.key, polylineInstance);
    mapRef.current.add(polylineInstance);
  }, [mapRef]);

  const drawMarker = useCallback((marker: MarkerProperties) => {
    if(!instanceRef.current || !mapRef.current) return;

    if(markersRef.current.has(marker.key)) {
      markersRef.current.get(marker.key).getContentDom().hidden = marker.hidden || false;
      markersRef.current.get(marker.key).setPosition(marker.location);
      return;
    }
    
    const markerInstance = new instanceRef.current.Marker({
      position: marker.location,
      content: renderToStaticMarkup(marker.content),
      offset: new instanceRef.current.Pixel(...marker.offset),
    });
    markerInstance.getContentDom().hidden = marker.hidden || false;

    markersRef.current.set(marker.key, markerInstance);
    mapRef.current.add(markerInstance);
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
        center: location,
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

      setMapLoaded(true);
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

    polylines.forEach((polyline) => drawPolyline(polyline));
  }, [polylines, isMapLoaded, mapRef, drawPolyline]);

  useEffect(() => {
    if(!mapRef.current) return;

    markers.forEach((marker) => drawMarker(marker));
  }, [markers, isMapLoaded, mapRef, drawMarker]);

  useEffect(() => {
    if(!mapRef.current || !location) return;

    if(autoCenteringRange && !isMoving) {
      const { x: cx, y: cy } = mapRef.current.lngLatToContainer(location);
      const { clientWidth: cw, clientHeight: ch } = mapRef.current.getContainer();
      if(
        !isMoving
        && (
          cx <= autoCenteringRange
          || cx >= cw - autoCenteringRange
          || cy <= autoCenteringRange
          || cy >= ch - autoCenteringRange
        )
      ) {
        mapRef.current.setCenter(location);
      }
    }
  }, [autoCenteringRange, location, isMoving, isMapLoaded, mapRef]);

  return <div ref={containerRef} style={{ width, height }}/>;
}
