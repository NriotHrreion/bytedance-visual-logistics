import type { DeliveryStatus, Order } from "types";
import Link from "next/link";
import { format } from "date-fns";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLocationName } from "@/lib/amap-api";
import { Spinner } from "@/components/ui/spinner";

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
  routes
}: Order) {
  const latestLocation = routes.length > 0 ? routes[routes.length - 1] : null;
  const { data: locationName, isLoading } = useSWR(
    `/regeo/${latestLocation ? latestLocation.join(",") : ""}`,
    () => latestLocation ? getLocationName(latestLocation) : null
  );

  return (
    <Card className="h-24 px-3 py-2 flex flex-row gap-6">
      <div className="flex-1 flex flex-col justify-between">
        <Link
          href={`/client/orders/${id}`}
          className="font-semibold hover:underline decoration-2">
          {name}
        </Link>
        {routes.length > 0 && (
          isLoading
          ? <Spinner />
          : <span className="text-sm">{locationName}</span>
        )}
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
    </Card>
  );
}
