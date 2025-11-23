"use client";

import { useState } from "react";
import { Package, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group";
import { OrderItem } from "@/components/order-item";
import { searchStringCompare } from "@/lib/search";
import { useOrders } from "@/hooks/use-orders";
import { Spinner } from "@/components/ui/spinner";
import { Header, HeaderTitle } from "@/components/ui/header";

export default function ClientPage() {
  const { orders, isLoading } = useOrders();
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="px-8 max-sm:px-4 flex flex-col gap-4">
      <Header>
        <HeaderTitle>我的订单</HeaderTitle>
        <InputGroup>
          <InputGroupAddon>
            <Package />
          </InputGroupAddon>
          <InputGroupInput
            value={searchValue}
            placeholder="查询订单..."
            autoFocus
            onChange={(e) => setSearchValue(e.target.value)}
            suppressHydrationWarning/>
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-sm"
              className={searchValue === "" ? "hidden" : ""}
              onClick={() => setSearchValue("")}>
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Header>
      <div className="flex flex-col gap-3">
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
              .filter(({ id, name }) => (
                searchValue !== ""
                ? (id.includes(searchValue) || searchStringCompare(name, searchValue))
                : true
              ))
              .map((order) => (
                <OrderItem
                  {...order}
                  detailsHref={`/client/orders/${order.id}`}
                  receiveButton={order.status !== "pending" && order.status !== "received" && order.status !== "cancelled"}
                  key={order.id}/>
              ))
          )
        }
      </div>
    </div>
  );
}
