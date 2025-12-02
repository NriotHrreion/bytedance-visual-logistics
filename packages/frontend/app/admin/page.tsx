"use client";

import type { DeliveryStatus } from "shared";
import { PackagePlus, Store } from "lucide-react";
import { Header, HeaderTitle } from "@/components/ui/header";
import {
  FilterInput,
  type FilterDefs,
  type FiltersType,
  useFilterInput
} from "@/components/filter-input";
import { useOrders } from "@/hooks/use-orders";
import { Spinner } from "@/components/ui/spinner";
import { OrderItem } from "@/components/order-item";
import { searchStringCompare } from "@/lib/search";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CreateOrderDialog } from "./create-order-dialog";
import { StoreInfoDialog } from "./store-info-dialog";

interface OrderFilters extends FiltersType {
  status: Set<DeliveryStatus>
}

const filterDefs: FilterDefs<OrderFilters> = [
  {
    id: "status",
    name: "订单状态",
    values: [
      { name: "待发货", value: "pending" },
      { name: "配送中", value: "delivering" },
      { name: "待取件", value: "delivered" },
      { name: "已签收", value: "received" },
      { name: "已取消", value: "cancelled" },
    ]
  }
];

export default function AdminPage() {
  const { orders, isLoading, mutate } = useOrders();
  const { searchValue, filters, ...filterInput } = useFilterInput(filterDefs);

  return (
    <div className="px-[20%]">
      <Header>
        <HeaderTitle>订单管理</HeaderTitle>
        <div className="flex gap-2">
          <FilterInput
            className="flex-1"
            searchValue={searchValue}
            filters={filters}
            {...filterInput}/>
          <StoreInfoDialog asChild>
            <Button variant="outline">
              <Store />
              店铺信息
            </Button>
          </StoreInfoDialog>
          <CreateOrderDialog
            onCreate={() => mutate()}
            asChild>
            <Button>
              <PackagePlus />
              创建订单
            </Button>
          </CreateOrderDialog>
        </div>
      </Header>
      <div className={cn(isLoading ? "flex flex-col" : "grid", "mt-4 grid-cols-2 gap-4")}>
        {
          isLoading
          ? (
            <div className="self-center flex items-center gap-2">
              <Spinner />
              <span>加载中...</span>
            </div>
          )
          : (
            orders
              .filter(({ id, name, status }) => (
                (
                  filters.status.size !== 0
                  ? filters.status.has(status)
                  : true
                ) &&
                (
                  searchValue !== ""
                  ? (id.includes(searchValue) || searchStringCompare(name, searchValue))
                  : true
                )
              ))
              .map((order) => (
                <OrderItem
                  {...order}
                  detailsHref={`/admin/orders/${order.id}`}
                  displayCurrentLocation
                  deliverButton={order.status === "pending"}
                  cancelButton
                  deleteButton
                  onChange={() => mutate()}
                  key={order.id}/>
              ))
          )
        }
      </div>
    </div>
  );
}
