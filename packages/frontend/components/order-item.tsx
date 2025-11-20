import type { Order } from "types";
import Link from "next/link";
import { format } from "date-fns";
import { PackageCheck, TruckElectric } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GeoLocationLabel } from "@/components/geolocation-label";
import { Hint, HintContent } from "./ui/hint";

export function OrderItem({
  id,
  name,
  createdAt,
  status,
  routes,
  destination,
  inOrderPage = false
}: Order & {
  inOrderPage?: boolean
}) {
  const latestRoute = routes.length > 0 ? routes[routes.length - 1] : null;

  return (
    <Card className="p-3 gap-2">
      <div className="h-20 flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <Link
            href={`/client/orders/${id}`}
            className="font-semibold hover:underline decoration-2 whitespace-nowrap text-ellipsis overflow-hidden">
            {name}
          </Link>
          {routes.length > 0 && <GeoLocationLabel className="text-sm whitespace-nowrap" location={latestRoute.location}/>}
          <span
            className="text-sm text-muted-foreground"
            title={createdAt.toTimeString()}>
            {format(createdAt, "yyyy-MM-dd HH:mm")}
          </span>
        </div>
        <div className="w-fit flex flex-col justify-between items-end">
          <span className="text-sm text-muted-foreground">{id}</span>
          {status === "pending" && (
            <Badge variant="outline">待发货</Badge>
          )}
          {status === "delivering" && (
            <Badge variant="outline">
              <div className="w-2 h-2 rounded-full bg-yellow-600"/>
              配送中
            </Badge>
          )}
          {status === "delivered" && (
            <Badge variant="outline">
              <div className="w-2 h-2 rounded-full bg-green-600"/>
              待取件
            </Badge>
          )}
          {status === "received" && (
            <Badge variant="outline">
              <div className="w-2 h-2 rounded-full bg-green-600"/>
              已签收
            </Badge>
          )}
          {status === "cancelled" && (
            <Badge variant="outline">
              <div className="w-2 h-2 rounded-full bg-red-700"/>
              已取消
            </Badge>
          )}
        </div>
      </div>
      {status === "delivering" && (
        <Hint>
          <TruckElectric size={17}/>
          <HintContent>预计明天送达</HintContent>
        </Hint>
      )}
      {status === "delivered" && (
        <Hint variant="success">
          <PackageCheck size={17}/>
          <HintContent>已送达 - 取件码 000-000-000</HintContent>
        </Hint>
      )}
      <div className="border-t pt-2 flex justify-between items-center whitespace-nowrap">
        <span className="text-xs">
          送至&nbsp;
          <GeoLocationLabel location={destination}/>
        </span>
        <div className="space-x-2 flex-nowrap">
          {!inOrderPage && (
            <Button
              variant="outline"
              size="xs"
              asChild>
              <Link href={`/client/orders/${id}`}>
                查看物流
              </Link>
            </Button>
          )}
          {(status !== "pending" && status !== "received" && status !== "cancelled") && (
            <Button size="xs">
              确认收货
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
