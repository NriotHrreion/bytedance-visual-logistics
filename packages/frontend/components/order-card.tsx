import type { OrderInfoDTO } from "shared";
import { useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Ellipsis, PackageCheck, PackageX, Trash2, TruckElectric } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GeoLocationLabel } from "@/components/geolocation-label";
import { Hint, HintContent } from "./ui/hint";
import { Price } from "./price";
import { useOrder } from "@/hooks/use-order";
import { estimateEtaHour, formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { StatusBadge } from "./status-badge";

interface OrderCardOptions {
  detailsHref?: string
  deliverButton?: boolean
  receiveButton?: boolean
  cancelButton?: boolean
  deleteButton?: boolean
  displayCurrentLocation?: boolean
  displayClaimCode?: boolean
  onChange?: () => void
}

export function OrderCard({
  id,
  name,
  price,
  createdAt,
  status,
  origin,
  destination,
  claimCode,
  current,
  currentPointIndex,
  routeLength,
  detailsHref,
  deliverButton = false,
  receiveButton = false,
  cancelButton = false,
  deleteButton = false,
  displayCurrentLocation = false,
  displayClaimCode = false,
  onChange
}: OrderInfoDTO & OrderCardOptions) {
  const { deliver, receive, cancel, delete: del } = useOrder(id);
  const etaHour = useMemo(
    () => estimateEtaHour(origin, destination, currentPointIndex / routeLength).toFixed(1),
    [origin, destination, currentPointIndex, routeLength]
  );

  return (
    <Card className="p-3 gap-2">
      <div className="flex-1 flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-2 justify-between">
          {
            detailsHref
            ? (
              <Link
                href={detailsHref}
                className="mb-auto font-semibold hover:underline decoration-2 whitespace-nowrap text-ellipsis overflow-hidden">
                {name}
              </Link>
            )
            : (
              <span className="mb-auto font-semibold whitespace-nowrap text-ellipsis overflow-hidden">
                {name}
              </span>
            )
          }
          {(current && displayCurrentLocation) && (
            <GeoLocationLabel className="text-sm whitespace-nowrap" location={current}/>
          )}
          <span
            className="text-sm text-muted-foreground"
            title={new Date(createdAt).toTimeString()}>
            {formatDate(createdAt)}
          </span>
        </div>
        <div className="w-fit flex flex-col justify-between items-end">
          <StatusBadge status={status}/>
          <div className="pr-1">
            <span className="mr-1 text-xs">实付款</span>
            <Price price={price} className="inline-block"/>
          </div>
        </div>
      </div>
      {status === "delivering" && (
        <Hint>
          <TruckElectric size={17}/>
          <HintContent>预计 {etaHour} 小时后送达</HintContent>
        </Hint>
      )}
      {(claimCode && displayClaimCode) && (
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
          {(cancelButton || deleteButton) && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={async () => {
                      await cancel();
                      onChange && onChange();
                    }}>
                    <PackageX />
                    取消订单
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={async () => {
                      await del();
                      onChange && onChange();
                    }}>
                    <Trash2 />
                    删除订单
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
              toast.promise(deliver, {
                loading: "正在规划路线...",
                success: () => {
                  onChange && onChange();
                  return "发货成功";
                },
                error: (e) => `发货失败：${e}`
              });
            }}>
              物流发货
            </Button>
          )}
          {receiveButton && (
            <Button size="xs" onClick={async () => {
              await receive();
              onChange && onChange();
            }}>
              确认收货
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
