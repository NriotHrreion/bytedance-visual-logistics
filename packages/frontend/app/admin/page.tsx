"use client";

import type { DeliveryStatus } from "types";
import { Header, HeaderTitle } from "@/components/ui/header";
import {
  FilterInput,
  type FilterDefs,
  type FiltersType,
  useFilterInput
} from "@/components/filter-input";

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
  const { searchValue, filters, ...filterInput } = useFilterInput(filterDefs);

  return (
    <div className="px-[20%]">
      <Header>
        <HeaderTitle>订单管理</HeaderTitle>
        <div className="flex flex-col">
          <FilterInput
            searchValue={searchValue}
            filters={filters}
            {...filterInput}/>
        </div>
      </Header>
    </div>
  );
}
