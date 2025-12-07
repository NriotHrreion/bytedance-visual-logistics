"use client";

import { getDeliveryStatusPriority, type DeliveryStatus } from "shared";
import { useState } from "react";
import { ArrowDownUp, PackagePlus, Store } from "lucide-react";
import { Header, HeaderTitle } from "@/components/ui/header";
import {
  FilterInput,
  type FilterDefs,
  type FiltersType,
  useFilterInput
} from "@/components/filter-input";
import { useOrders } from "@/hooks/use-orders";
import { Spinner } from "@/components/ui/spinner";
import { OrderCard } from "@/components/order-card";
import { searchStringCompare } from "@/lib/search";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CreateOrderDialog } from "./create-order-dialog";
import { StoreInfoDialog } from "./store-info-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface OrderFilters extends FiltersType {
  status: Set<DeliveryStatus>
}

enum SortingType {
  ALPHABETIC = "alphabetic",
  PRICE = "price",
  TIME = "time",
  STATUS = "status"
}

enum SortingDirection {
  ASC = "ascending",
  DESC = "descending"
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
  const [sortingType, setSortingType] = useState<SortingType>(SortingType.ALPHABETIC);
  const [sortingDirection, setSortingDirection] = useState<SortingDirection>(SortingDirection.ASC);

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ArrowDownUp />
                排序
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={sortingType}
                onValueChange={(e) => setSortingType(e as SortingType)}>
                <DropdownMenuRadioItem value={SortingType.ALPHABETIC}>名称</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={SortingType.PRICE}>价格</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={SortingType.TIME}>创建时间</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={SortingType.STATUS}>订单状态</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortingDirection}
                onValueChange={(e) => setSortingDirection(e as SortingDirection)}>
                <DropdownMenuRadioItem value={SortingDirection.ASC}>升序</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={SortingDirection.DESC}>降序</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
              .toSorted((a, b) => {
                const dir = sortingDirection === SortingDirection.ASC ? 1 : -1;
                switch(sortingType) {
                  case SortingType.ALPHABETIC:
                    return a.name.localeCompare(b.name) * dir;
                  case SortingType.PRICE:
                    return (a.price - b.price) * dir;
                  case SortingType.TIME:
                    return (a.createdAt - b.createdAt) * dir;
                  case SortingType.STATUS:
                    return (getDeliveryStatusPriority(a.status) - getDeliveryStatusPriority(b.status)) * dir;
                }
              })
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
                <OrderCard
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
