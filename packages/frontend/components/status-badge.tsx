import type { DeliveryStatus } from "shared";
import { Badge } from "./ui/badge";

export function StatusBadge({ status }: {
  status: DeliveryStatus
}) {
  return (
    <>
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
    </>
  );
}
