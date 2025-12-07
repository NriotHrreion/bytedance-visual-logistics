"use client";

import type { GeoLocation } from "shared";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { MousePointer2 } from "lucide-react";
import {
  Timeline,
  TimelineItem,
  TimelineItemContent,
  TimelineItemHeader,
  TimelineItemTime,
  TimelineItemTitle,
  TimelineMore
} from "@/components/ui/timeline";
import { GeoLocationLabel } from "@/components/geolocation-label";
import { OrderCard } from "@/components/order-card";
import { copyToClipboard, getCurrentState } from "@/lib/utils";
import { useOrder } from "@/hooks/use-order";
import { useDeliveryPaths } from "@/hooks/use-delivery-paths";
import { RealtimeRouteClient } from "@/lib/ws/realtime-route";
import { Button } from "@/components/ui/button";

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
  const updateIntervalRef = useRef<number>(1000);
  const [displayedPoint, setDisplayedPoint] = useState<GeoLocation | null>(null);
  const animationTimerRef = useRef<number | null>(null);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyClaimCode = async () => {
    if(!order || !order.claimCode) return;
    
    try {
      await copyToClipboard(order.claimCode);
      setCodeCopied(true);
    } catch (e) {
      console.error(e);
      setCodeCopied(false);
    }
  };

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
  }, [order, points, currentPointIndex, updateIntervalRef]);

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
    <div>
      <div className="relative">
        <AMapContainer
          height={450}
          location={displayedPoint}
          autoCenteringRange={100}
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
            }
          ]}
          ref={mapRef}/>
        <Button
          variant="outline"
          size="icon"
          title="定位到当前位置"
          className="max-w-10 max-h-10 absolute bottom-4 right-4 shadow-md"
          onClick={() => {
            mapRef.current.setCenter(displayedPoint ?? points[currentPointIndex]);
          }}>
          <MousePointer2 />
        </Button>
      </div>
      <div className="px-8 max-sm:px-4">
        <Timeline className="mx-3 py-6">
          {paths.toReversed().map(({ time, location, action, claimCode }, i) => {
            const isLast = i === paths.length - 1;
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
                  if(!isLast) return "default";
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
                    (isLast && isDelivering) ? order.current : location
                  }/>
                  {(isLast && claimCode) && (
                    <div className="mt-1 px-3 py-2 border bg-muted rounded-md flex flex-col gap-1">
                      <span className="text-2xl text-foreground font-semibold">{claimCode}</span>
                      <div className="flex justify-between">
                        <span className="text-sm">快递驿站 取件码</span>
                        <button
                          className="text-sm cursor-pointer"
                          onClick={() => handleCopyClaimCode()}>
                          {codeCopied ? "复制成功" : "复制"}
                        </button>
                      </div>
                    </div>
                  )}
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
        <OrderCard
          {...order}
          receiveButton={order.status !== "pending" && order.status !== "received" && order.status !== "cancelled"}
          onChange={() => mutate()}/>
      </div>
    </div>
  );
}
