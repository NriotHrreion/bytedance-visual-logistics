"use client";

import { use, useEffect, useMemo } from "react";
import { mockOrderList } from "types/mocks";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { format } from "date-fns";
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
  const latestRoute = order.routes.length > 0 ? order.routes[order.routes.length - 1] : null;

  if(!order) {
    return <p>Not found</p>;
  }  

  return (
    <div className="flex flex-col">
      {latestRoute && (
        <div>
          <AMapContainer height={450} location={latestRoute.location}/>
        </div>
      )}
      <Timeline className="mx-3 py-6" reverse>
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
  );
}
