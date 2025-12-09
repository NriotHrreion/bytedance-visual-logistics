"use client";

import type { GeoLocation } from "shared";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Eye, EyeClosed, MousePointer2 } from "lucide-react";
import { useDeliveryPaths } from "@/hooks/use-delivery-paths";
import { useOrder } from "@/hooks/use-order";
import { GeoLocationLabel } from "@/components/geolocation-label";
import {
  Timeline,
  TimelineItem,
  TimelineItemContent,
  TimelineItemHeader,
  TimelineItemTime,
  TimelineItemTitle,
  TimelineMore
} from "@/components/ui/timeline";
import { OrderCard } from "@/components/order-card";
import { RealtimeRouteClient } from "@/lib/ws/realtime-route";
import { estimateEtaHour, getCurrentState } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapLabel } from "@/components/map-label";

import TruckIcon from "@/assets/truck.png";

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { order, isLoading: isOrderLoading, mutate } = useOrder(id);
  const { paths } = useDeliveryPaths(id);
  const wsClient = useMemo(() => new RealtimeRouteClient(id), [id]);
  const mapRef = useRef<AMap.Map | null>(null);
  const [points, setPoints] = useState<GeoLocation[]>([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const updateIntervalRef = useRef<number>(1);
  const [displayedPoint, setDisplayedPoint] = useState<GeoLocation | null>(null);
  const animationTimerRef = useRef<number | null>(null);
  const [receiverVisible, setReceiverVisible] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const etaHour = useMemo(
    () => (
      order && points.length > 0
      ? estimateEtaHour(order.origin, order.destination, order.currentPointIndex / points.length).toFixed(1)
      : "0"
    ),
    [order, points]
  );

  const handleVisibilityChange = useCallback(() => {
    setDisplayedPoint(points[currentPointIndex]);
  }, [points, currentPointIndex]);

  useEffect(() => {
    wsClient.on("init-route", (route, currentPointIndex) => {
      setPoints(route);
      setDisplayedPoint(route[currentPointIndex]);
    });

    wsClient.on("update-route", async (currentPointIndex, updateInterval) => {
      setCurrentPointIndex(currentPointIndex);
      updateIntervalRef.current = updateInterval;

      const routePoints = await getCurrentState(setPoints);
      setDisplayedPoint(routePoints[currentPointIndex]);
      
      if(currentPointIndex + 1 < routePoints.length) {
        const currentPoint = routePoints[currentPointIndex];
        const nextPoint = routePoints[currentPointIndex + 1];
        const angle = Math.atan2(
          nextPoint[0] - currentPoint[0],
          nextPoint[1] - currentPoint[1]
        ) * (180 / Math.PI);
        const truckMarker = document.getElementById("truck-indicator");
        truckMarker?.style.setProperty("transform", `rotate(${angle}deg)`);
        truckMarker?.style.setProperty("display", "block");
      }
    });

    return () => wsClient.close();
  }, [wsClient]);

  useEffect(() => {
    if(!order || order.status !== "delivering") return;
    if(currentPointIndex + 2 >= points.length || updateIntervalRef.current === null) return;

    const currentPoint = points[currentPointIndex];
    const nextPoint = points[currentPointIndex + 1];
    const vx = (nextPoint[0] - currentPoint[0]) / updateIntervalRef.current;
    const vy = (nextPoint[1] - currentPoint[1]) / updateIntervalRef.current;

    let lastTimestamp: number | null = null;

    function animate(timestamp: number) {
      if(!animationTimerRef.current) return;

      if(lastTimestamp === null) {
        lastTimestamp = timestamp;
        animationTimerRef.current = window.requestAnimationFrame(animate);
        return;
      }
      
      const delta = timestamp - lastTimestamp; // ms
      lastTimestamp = timestamp;

      setDisplayedPoint(([x, y]) => [
        x + vx * delta,
        y + vy * delta
      ]);

      animationTimerRef.current = window.requestAnimationFrame(animate);
    }

    animationTimerRef.current = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(animationTimerRef.current);
      animationTimerRef.current = null;
    };
  }, [order, points, currentPointIndex]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleVisibilityChange]);

  if(isOrderLoading || !displayedPoint) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xl font-semibold">加载中</span>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if(!order) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xl font-semibold">订单不存在</span>
          <span className="text-sm text-muted-foreground">找不到订单号为 {id} 的订单信息</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-h-0">
      <div className="flex-2 *:w-full *:h-full relative">
        <AMapContainer
          location={displayedPoint}
          autoCenteringRange={200}
          polylines={[
            { key: "route", points, color: "#caeccc" },
            { key: "travelled-route", points: [...points.slice(0, currentPointIndex + 1), displayedPoint], color: "green" }
          ]}
          markers={[
            {
              key: "truck-indicator",
              location: displayedPoint,
              content: (
                <img
                  width={25.75}
                  height={55.75}
                  src={TruckIcon.src}
                  alt="truck-indicator"
                  id="truck-indicator"
                  style={{ display: "none" }}/>
              ),
              offset: [-12.875, -27.875]
            },
            {
              key: "origin",
              location: order.origin,
              content: <div className="w-3 h-3 rounded-full border-2 border-green-700 bg-green-50"/>,
              offset: [0, 0]
            },
            {
              key: "origin-label",
              location: order.origin,
              content: (
                order.status === "pending"
                ? <MapLabel>订单尚未发货</MapLabel>
                : (
                  <MapLabel>
                    <Check size={19} stroke="var(--color-green-700)"/>
                    订单已发货
                  </MapLabel>
                )
              ),
              offset: [0, 15],
              dynamic: true
            },
            {
              key: "destination",
              location: order.destination,
              content: <div className="w-3 h-3 rounded-full border-2 border-green-700 bg-green-50"/>,
              offset: [0, 0]
            },
            {
              key: "destination-label",
              location: order.destination,
              content: (
                <MapLabel>
                  预计 {etaHour} 小时后送达
                </MapLabel>
              ),
              offset: [0, 15],
              hidden: order.status !== "delivering",
              dynamic: true
            }
          ]}
          ref={mapRef}/>
        <Button
          variant="outline"
          size="icon"
          title="定位到当前位置"
          className="max-w-10 max-h-10 absolute bottom-8 right-8 shadow-md"
          onClick={() => {
            mapRef.current.setCenter(displayedPoint ?? points[currentPointIndex]);
          }}>
          <MousePointer2 />
        </Button>
      </div>
      <div className="flex-1 border-l shadow-lg z-10 flex flex-col">
        <div className="px-7 py-6 space-y-4 border-b shadow-sm z-10">
          <h1 className="text-xl font-semibold">订单详情</h1>
          <div className="flex flex-col gap-2 *:flex *:justify-between *:[&>span]:last:text-muted-foreground">
            <div>
              <span>订单号</span>
              <span>{order.id}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>收货人</span>
                <button
                  className="cursor-pointer"
                  onClick={() => setReceiverVisible((v) => !v)}>
                  {
                    receiverVisible
                    ? <Eye size={16}/>
                    : <EyeClosed size={16}/>
                  }
                </button>
              </div>
              <span>
                {
                  receiverVisible
                  ? (order.receiver || "-")
                  : (order.receiver ? (order.receiver[0] +"*") : "-")
                }
              </span>
            </div>
            <div>
              <span>收货地</span>
              <GeoLocationLabel location={order.destination}/>
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 pb-4 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Timeline className="h-fit min-h-full mx-5 py-6 mb-auto">
              {paths.toReversed().map(({ time, location, action }, i) => {
                const isLatest = i === 0;
                const isDelivering = order.status === "delivering";
                const isDelivered = order.status === "delivered";
                const isReceived = order.status === "received";
                const isCancelled = order.status === "cancelled";
                const secondary = i + 1 < paths.length && action === paths[i + 1].action;
                
                if(secondary && !timelineExpanded) return <React.Fragment key={i}/>;
                
                return (
                  <TimelineItem
                    variant={(() => {
                      if(secondary) return "secondary";
                      if(!isLatest) return "default";
                      if(isDelivered || isReceived) return "success";
                      if(isCancelled) return "destructive";
                    })()}
                    key={i}>
                    <TimelineItemHeader>
                      <TimelineItemTitle>{action}</TimelineItemTitle>
                      <TimelineItemTime time={new Date(time)}/>
                    </TimelineItemHeader>
                    <TimelineItemContent>
                      <GeoLocationLabel location={
                        (isLatest && isDelivering) ? order.current : location
                      }/>
                    </TimelineItemContent>
                  </TimelineItem>
                );
              })}
              <TimelineMore
                expanded={timelineExpanded}
                onClick={() => setTimelineExpanded((prev) => !prev)}>
                {timelineExpanded ? "收起更多物流明细" : "展开更多物流明细"}
              </TimelineMore>
            </Timeline>
          </div>
          <OrderCard
            {...order}
            deliverButton={order.status === "pending"}
            cancelButton
            deleteButton
            onChange={() => mutate()}/>
        </div>
      </div>
    </div>
  );
}
