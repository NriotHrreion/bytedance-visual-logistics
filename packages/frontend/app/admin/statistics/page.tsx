"use client";

import dynamic from "next/dynamic";
import { getDeliveryStatusPriority } from "shared";
import { Header, HeaderTitle } from "@/components/ui/header";
import { useStatistics } from "@/hooks/use-statistics";
import { Price } from "@/components/price";
import { OrdersTable } from "./orders-table";

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

function StatisticsSection({ title, children, className }: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className={className}>
        {children}
      </div>
    </section>
  );
}

export default function StatisticsPage() {
  const { statistics, isLoading } = useStatistics();

  if(isLoading || !statistics) {
    return (
      <div className="px-[20%] flex flex-col h-full">
        <Header>
          <HeaderTitle>数据看板</HeaderTitle>
        </Header>
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xl font-semibold">加载中</span>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[20%] pb-14 space-y-8">
      <Header>
        <HeaderTitle>数据看板</HeaderTitle>
      </Header>

      <StatisticsSection title="订单数据" className="pb-4 border-b">
        <OrdersTable data={
          statistics.orders.toSorted((a, b) => getDeliveryStatusPriority(a.status) - getDeliveryStatusPriority(b.status))
        }/>
      </StatisticsSection>

      <div className="flex *:flex-1">
        <StatisticsSection title="总价格" className="space-x-2">
          <Price
            price={statistics.totalPrice}
            intClassName="text-4xl before:text-lg"
            decClassName="text-2xl"/>
        </StatisticsSection>
        <StatisticsSection title="平均配送距离" className="space-x-2">
          <span className="text-4xl font-semibold">
            {statistics.averageDistance.toFixed(2)}
          </span>
          <span>千米</span>
        </StatisticsSection>
        <StatisticsSection title="平均配送时间" className="space-x-2">
          <span className="text-4xl font-semibold">
            {(statistics.averageTravelledTime / 1000 / 60 / 60).toFixed(2)}
          </span>
          <span>小时</span>
        </StatisticsSection>
      </div>

      <StatisticsSection title="目的地分布" className="rounded-sm overflow-hidden">
        <AMapContainer
          height={500}
          location={[103.980644, 35.926411]}
          zoom={4.5}
          markers={statistics.orders.map(({ destination }) => ({
            key: destination.join(","),
            location: destination,
            content: <div className="w-1 h-1 rounded-full bg-green-700"/>,
            offset: [0, 0]
          }))}/>
      </StatisticsSection>
    </div>
  );
}
