"use client";

import { useMemo, useState } from "react";
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
import { copyToClipboard } from "@/lib/utils";

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const order = useMemo(() => mockOrderList.find(({ id: _id }) => id === _id), [id]);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyClaimCode = async () => {
    try {
      await copyToClipboard("000-000-000");
      setCodeCopied(true);
    } catch (e) {
      console.error(e);
      setCodeCopied(false);
    }
  };
  
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
                  <TimelineItemTitle>
                    {(() => {
                      if(isFirst) {
                        return "已发货";
                      }
                      if(isLast && isDelivered) {
                        return "待取件";
                      }
                      if(isLast && isReceived) {
                        return "已签收";
                      }
                      if(isLast && isCancelled) {
                        return "已取消";
                      }
                      return "配送中";
                    })()}
                  </TimelineItemTitle>
                  <TimelineItemTime time={time}/>
                </TimelineItemHeader>
                <TimelineItemContent>
                  <GeoLocationLabel location={location}/>
                  {(isLast && isDelivered) && (
                    <div className="mt-1 px-3 py-2 border bg-muted rounded-md flex flex-col gap-1">
                      <span className="text-2xl text-foreground font-semibold">000-000-000</span>
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
        <OrderItem {...order} inOrderPage/>
      </div>
    </div>
  );
}
