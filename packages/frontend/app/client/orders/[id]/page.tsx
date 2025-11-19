"use client";

import { useMemo } from "react";
import { mockOrderList } from "types/mocks";
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

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const order = useMemo(() => mockOrderList.find(({ id: _id }) => id === _id), [id]);
  
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
  
  const latestRoute = order.routes.length > 0 ? order.routes[order.routes.length - 1] : null;
  
  return (
    <div>
      {latestRoute && <AMapContainer height={450} location={latestRoute.location}/>}
      <div className="px-8 max-sm:px-4">
        <Timeline className="mx-3 py-6" reverse>
          <TimelineItem>
            <TimelineItemHeader>
              <TimelineItemTitle>订单已创建</TimelineItemTitle>
              <TimelineItemTime time={order.createdAt}/>
            </TimelineItemHeader>
            {order.status === "pending" && <TimelineItemContent>待发货</TimelineItemContent>}
          </TimelineItem>
          {order.routes.map(({ time, location }, i) => {
            const isFirst = i === 0;
            const isLast = i === order.routes.length - 1;
            const isDelivered = order.status === "delivered";
            return (
              <TimelineItem
                active={isLast}
                success={isLast && isDelivered}
                key={i}>
                <TimelineItemHeader>
                  <TimelineItemTitle>
                    {
                      isFirst
                      ? "已发货"
                      : (
                        isLast && isDelivered
                        ? "已到货"
                        : "配送中"
                      )
                    }
                  </TimelineItemTitle>
                  <TimelineItemTime time={time}/>
                </TimelineItemHeader>
                <TimelineItemContent>
                  <GeoLocationLabel location={location}/>
                </TimelineItemContent>
              </TimelineItem>
            );
          })}
        </Timeline>
        <OrderItem {...order} inOrderPage/>
      </div>
    </div>
  );
}
