import type { OrderInfoDTO } from "types";
import Link from "next/link";
import { Ellipsis, PackageCheck, PackageMinus, PackageX, TruckElectric } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GeoLocationLabel } from "@/components/geolocation-label";
import { Hint, HintContent } from "./ui/hint";
import { Price } from "./price";
import { useOrder } from "@/hooks/use-order";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";

export function OrderItem({
  id,
  name,
  price,
  createdAt,
  status,
  destination,
  currentLocation,
  claimCode,
  detailsHref,
  deliverButton = false,
  receiveButton = false,
  cancelButton = false,
  deleteButton = false
}: OrderInfoDTO & {
  detailsHref?: string
  deliverButton?: boolean
  receiveButton?: boolean
  cancelButton?: boolean
  deleteButton?: boolean
}) {
  const { deliver, receive, cancel, delete: del } = useOrder(id);

  return (
    <Card className="p-3 gap-2">
      <div className="flex-1 flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-2 justify-between">
          <Link
            href={`/client/orders/${id}`}
            className="font-semibold hover:underline decoration-2 whitespace-nowrap text-ellipsis overflow-hidden">
            {name}
          </Link>
          <div className="flex flex-col gap-2">
            {currentLocation && <GeoLocationLabel className="text-sm whitespace-nowrap" location={currentLocation}/>}
            <span
              className="text-sm text-muted-foreground"
              title={new Date(createdAt).toTimeString()}>
              {formatDate(createdAt)}
            </span>
          </div>
        </div>
        <div className="w-fit flex flex-col justify-between items-end">
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
          <div className="pr-1">
            <span className="mr-1 text-xs">实付款</span>
            <Price price={price} className="inline-block"/>
          </div>
        </div>
      </div>
      {status === "delivering" && (
        <Hint>
          <TruckElectric size={17}/>
          <HintContent>预计明天送达</HintContent>
        </Hint>
      )}
      {claimCode && (
        <Hint variant="success">
          <PackageCheck size={17}/>
          <HintContent>已送达 - 取件码 <span className="font-semibold">{claimCode}</span></HintContent>
        </Hint>
      )}
      <div className="border-t pt-2 flex justify-between items-center whitespace-nowrap">
        <span className="text-xs">
          送至&nbsp;
          <GeoLocationLabel location={destination}/>
        </span>
        <div className="flex items-center gap-2">
          {detailsHref && (
            <Button
              variant="outline"
              size="xs"
              asChild>
              <Link href={detailsHref}>
                详细信息
              </Link>
            </Button>
          )}
          {deliverButton && (
            <Button size="xs" onClick={() => {
              deliver();
              window.location.reload();
            }}>
              物流发货
            </Button>
          )}
          {receiveButton && (
            <Button size="xs" onClick={() => {
              receive();
              window.location.reload();
            }}>
              确认收货
            </Button>
          )}
          {(cancelButton || deleteButton) && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => {
                      cancel();
                      window.location.reload();
                    }}>
                    <PackageMinus />
                    取消订单
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      del();
                      window.location.reload();
                    }}>
                    <PackageX />
                    删除订单
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  );
}
