"use client";

import { use, useMemo } from "react";
import { mockOrderList } from "types/mocks";
import dynamic from "next/dynamic";

const AMapContainer = dynamic(() => import("@/components/amap-container"), { ssr: false });

export default function OrderPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params);
  const order = useMemo(() => mockOrderList.find(({ id: _id }) => id === _id), [id]);
  const latestLocation = order.routes.length > 0 ? order.routes[order.routes.length - 1] : null;

  if(!order) {
    return <p>Not found</p>;
  }

  return (
    <div className="flex flex-col">
      <div>
        <AMapContainer height={450} location={latestLocation}/>
      </div>
    </div>
  );
}
