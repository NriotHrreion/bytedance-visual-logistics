"use client";

import type { GeoLocation } from "shared";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import {
  Timeline,
  TimelineItem,
  TimelineItemContent,
  TimelineItemHeader,
  TimelineItemTime,
  TimelineItemTitle
} from "@/components/ui/timeline";
import { GeoLocationLabel } from "@/components/geolocation-label";
import { OrderItem } from "@/components/order-item";
import { copyToClipboard, getCurrentState } from "@/lib/utils";
import { useOrder } from "@/hooks/use-order";
import { useDeliveryPaths } from "@/hooks/use-delivery-paths";
import { RealtimeRouteClient } from "@/lib/ws/realtime-route";

import TruckIcon from "@/assets/truck.png";

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { order, mutate } = useOrder(id);
  const { paths } = useDeliveryPaths(id);
  const wsRef = useRef<RealtimeRouteClient>(new RealtimeRouteClient(id));
  const [points, setPoints] = useState<GeoLocation[]>([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
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

  useEffect(() => {
    wsRef.current.on("init-route", (route) => {
      setPoints(route);
    });

    wsRef.current.on("update-route", async (currentPointIndex) => {
      setCurrentPointIndex(currentPointIndex);
      const routePoints = await getCurrentState(setPoints);
      if(currentPointIndex + 1 < routePoints.length) {
        const currentPoint = routePoints[currentPointIndex];
        const nextPoint = routePoints[currentPointIndex + 1];
        const angle = Math.atan2(
          nextPoint[0] - currentPoint[0],
          nextPoint[1] - currentPoint[1]
        ) * (180 / Math.PI);
        document.getElementById("truck-indicator")?.style.setProperty("transform", `rotate(${angle}deg)`);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => wsRef.current.close();
  }, []);
  
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
      <AMapContainer
        height={450}
        location={points[currentPointIndex]}
        autoCentered
        polylines={[
          { points, color: "#caeccc" },
          { points: points.slice(0, currentPointIndex + 1), color: "green" }
        ]}
        indicator
        indicatorContent={
          <img
            width={25.75}
            height={55.75}
            src={TruckIcon.src}
            alt="truck-indicator"
            id="truck-indicator"/>
        }
        indicatorOffset={[-12.875, -27.875]}/>
      <div className="px-8 max-sm:px-4">
        <Timeline className="mx-3 py-6" reverse>
          {paths.map(({ time, location, action, claimCode }, i) => {
            const isLast = i === paths.length - 1;
            const isDelivered = order.status === "delivered";
            const isReceived = order.status === "received";
            const isCancelled = order.status === "cancelled";
            return (
              <TimelineItem
                variant={(() => {
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
                  <GeoLocationLabel location={location}/>
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
        </Timeline>
        <OrderItem
          {...order}
          receiveButton={order.status !== "pending" && order.status !== "received" && order.status !== "cancelled"}
          onChange={() => mutate()}/>
      </div>
    </div>
  );
}
