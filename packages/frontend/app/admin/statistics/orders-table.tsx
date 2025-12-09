"use client";
"use no memo";

import { getDeliveryStatusPriority, type DeliveryStatus } from "shared";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ButtonGroup } from "@/components/ui/button-group";

interface OrdersTableDef {
  id: string
  name: string
  status: DeliveryStatus
  price: number
  progress: number
}

const columns: ColumnDef<OrdersTableDef>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        名称
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const { id, name } = row.original;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`/admin/orders/${id}`}
              className="block max-w-40 ml-3 font-semibold overflow-hidden text-ellipsis decoration-2 hover:underline">
              {name}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left">{id}</TooltipContent>
        </Tooltip>
      );
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        状态
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const { status } = row.original;
      return (
        <div className="w-full text-center">
          <StatusBadge status={status}/>
        </div>
      );
    },
    sortingFn: (a, b) => {
      return getDeliveryStatusPriority(a.original.status) - getDeliveryStatusPriority(b.original.status);
    }
  },
  {
    accessorKey: "price",
    header: () => "价格（元）",
    cell: ({ row }) => {
      const { price } = row.original;
      return price.toFixed(2);
    }
  },
  {
    accessorKey: "progress",
    header: () => <div className="w-52 float-right text-right">配送进度</div>,
    cell: ({ row }) => {
      const { progress } = row.original;
      return (
        <Progress
          value={progress * 100}
          className="w-full bg-muted *:data-[slot=progress-indicator]:bg-green-700"/>
      );
    }
  },
];

export function OrdersTable({ data }: {
  data: OrdersTableDef[]
}) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState([]);
  /** @see https://github.com/TanStack/table/issues/5567 */
  /** @see https://github.com/TanStack/table/issues/6018 */
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting
    }
  });

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {
                        header.isPlaceholder
                        ? null
                        : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )
                      }
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {
              table.getRowModel().rows?.length
              ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
              : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    暂无订单
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </div>
      <div className="pt-4 flex gap-3 items-center max-md:flex-col">
        <div className="flex gap-3 items-center [&_button]:cursor-pointer">
          <Button
            variant="outline"
            size="icon"
            title="跳转至第一页"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft />
          </Button>
          <ButtonGroup>
            <Button
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              <ChevronLeft />
              上一页
            </Button>
            <Button
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              下一页
              <ChevronRight />
            </Button>
          </ButtonGroup>
          <Button
            variant="outline"
            size="icon"
            title="跳转至最后一页"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}>
            <ChevronsRight />
          </Button>
        </div>
        <span className="text-muted-foreground text-sm">第 {pagination.pageIndex + 1} 页 / 共 {table.getPageCount()} 页</span>
      </div>
    </div>
  );
}
