"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import { useDeliveryPaths } from "@/hooks/use-delivery-paths";
import { useOrder } from "@/hooks/use-order";
import { GeoLocationLabel } from "@/components/geolocation-label";
import {
  Timeline,
  TimelineItem,
  TimelineItemContent,
  TimelineItemHeader,
  TimelineItemTime,
  TimelineItemTitle
} from "@/components/ui/timeline";
import { OrderItem } from "@/components/order-item";

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { order, mutate } = useOrder(id);
  const { paths } = useDeliveryPaths(id);
  const [receiverVisible, setReceiverVisible] = useState(false);

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

  const latestRoute = paths.length > 0 ? paths[paths.length - 1] : null;

  return (
    <div className="h-screen flex">
      <div className="flex-2 *:w-full *:h-full">
        {latestRoute && <AMapContainer location={latestRoute.location}/>}
      </div>
      <div className="flex-1 border-l shadow-lg z-10 flex flex-col">
        <div className="px-7 py-6 space-y-4 border-b">
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
            <Timeline className="h-fit min-h-full mx-5 py-6 mb-auto" reverse>
              {paths.map(({ time, location, action }, i) => {
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
                    </TimelineItemContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </div>
          <OrderItem
            {...order}
            detailsHref={`/admin/orders/${order.id}`}
            deliverButton={order.status === "pending"}
            cancelButton
            deleteButton
            onChange={() => mutate()}/>
        </div>
      </div>
    </div>
  );
}
