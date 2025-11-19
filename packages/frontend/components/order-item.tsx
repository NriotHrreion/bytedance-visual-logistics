import type { DeliveryStatus, Order } from "types";
import Link from "next/link";
import { format } from "date-fns";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLocationName } from "@/lib/amap-api";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { GeoLocationLabel } from "@/components/geolocation-label";

function getStatusLabel(status: DeliveryStatus) {
  switch(status) {
    case "pending": return "待发货";
    case "delivering": return "配送中";
    case "delivered": return "已到货";
  }
}

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
        <div className="flex-1 flex flex-col justify-between">
          <Link
            href={`/client/orders/${id}`}
            className="font-semibold hover:underline decoration-2">
            {name}
          </Link>
          {routes.length > 0 && <GeoLocationLabel className="text-sm" location={latestRoute.location}/>}
          <span
            className="text-sm text-muted-foreground"
            title={createdAt.toTimeString()}>
            {format(createdAt, "yyyy-MM-dd HH:mm")}
          </span>
        </div>
        <div className="w-28 flex flex-col justify-between items-end">
          <span className="text-sm text-muted-foreground">{id}</span>
          <Badge variant="outline">
            {status !== "pending" && (
              <div className={cn("w-2 h-2 rounded-full", status === "delivering" ? "bg-yellow-600" : "bg-green-600")}/>
            )}
            {getStatusLabel(status)}
          </Badge>
        </div>
      </div>
      <div className="border-t pt-2 flex justify-between items-center">
        <span className="text-sm font-semibold">
          送至&nbsp;
          <GeoLocationLabel location={destination}/>
        </span>
        <div className="space-x-2">
          {!inOrderPage && (
            <Button
              variant="outline"
              size="sm"
              asChild>
              <Link href={`/client/orders/${id}`}>
                查看物流
              </Link>
            </Button>
          )}
          <Button size="sm">
            确认收货
          </Button>
        </div>
      </div>
    </Card>
  );
}
