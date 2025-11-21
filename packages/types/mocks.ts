import type { DeliveryPath } from ".";

export const mockOrderList = [
  {
    id: "eBdC32",
    name: "iPhone 17 Pro Max 2TB",
    price: 17999,
    createdAt: new Date(2025, 11, 18).getTime(),
    status: "pending",
    destination: [120.72816841, 30.75408188]
  },
  {
    id: "rAdC12",
    name: "iPhone 17 512GB",
    price: 7999.3,
    createdAt: new Date(2025, 11, 17).getTime(),
    sentAt: new Date(2025, 11, 18).getTime(),
    status: "delivering",
    destination: [120.72816841, 30.75408188]
  },
  {
    id: "RktE73",
    name: "iPhone 16 Pro Max 1TB",
    price: 11177,
    createdAt: new Date(2025, 11, 17).getTime(),
    sentAt: new Date(2025, 11, 18).getTime(),
    status: "delivered",
    destination: [120.72816841, 30.75408188]
  },
  {
    id: "bS2rQ5",
    name: "iPhone 16 Plus 256GB",
    price: 6999,
    createdAt: new Date(2025, 11, 17).getTime(),
    sentAt: new Date(2025, 11, 18).getTime(),
    status: "received",
    destination: [120.72816841, 30.75408188]
  },
  {
    id: "e4Tr89",
    name: "iPhone 16 Plus 256GB",
    price: 6999,
    createdAt: new Date(2025, 11, 17).getTime(),
    sentAt: new Date(2025, 11, 18).getTime(),
    status: "cancelled",
    destination: [120.72816841, 30.75408188]
  },
];

export const mockPathsStore = new Map<string, DeliveryPath[]>([
  ["eBdC32", []],
  ["rAdC12", [
    {
      time: new Date(2025, 11, 17).getTime(),
      location: [118.78221974, 32.07915573],
      action: "已发货"
    }
  ]],
  ["RktE73", [
    {
      time: new Date(2025, 11, 17).getTime(),
      location: [121.42653336, 29.86982248],
      action: "已发货"
    },
    {
      time: new Date(2025, 11, 17, 12).getTime(),
      location: [120.08487785, 30.30987378],
      action: "配送中"
    },
    {
      time: new Date(2025, 11, 18).getTime(),
      location: [120.72816841, 30.75408188],
      action: "待取件",
      claimCode: "111-111-111"
    },
  ]],
  ["bS2rQ5", [
    {
      time: new Date(2025, 11, 17).getTime(),
      location: [121.42653336, 29.86982248],
      action: "已发货"
    },
    {
      time: new Date(2025, 11, 17, 12).getTime(),
      location: [120.08487785, 30.30987378],
      action: "配送中"
    },
    {
      time: new Date(2025, 11, 18).getTime(),
      location: [120.72816841, 30.75408188],
      action: "已签收"
    },
  ]],
  ["e4Tr89", [
    {
      time: new Date(2025, 11, 17).getTime(),
      location: [121.42653336, 29.86982248],
      action: "已发货"
    },
    {
      time: new Date(2025, 11, 17, 12).getTime(),
      location: [120.08487785, 30.30987378],
      action: "配送中"
    },
  ]]
]);
