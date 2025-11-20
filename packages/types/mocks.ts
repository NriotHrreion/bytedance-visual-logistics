import type { Order } from ".";

export const mockOrderList: Order[] = [
  {
    id: "eBdC32",
    name: "iPhone 17 Pro Max 2TB",
    price: 17999,
    createdAt: new Date(2025, 11, 18),
    status: "pending",
    routes: [],
    destination: [120.72816841, 30.75408188]
  },
  {
    id: "rAdC12",
    name: "iPhone 17 512GB",
    price: 7999.3,
    createdAt: new Date(2025, 11, 17),
    sentAt: new Date(2025, 11, 18),
    status: "delivering",
    routes: [
      {
        time: new Date(2025, 11, 17),
        location: [118.78221974, 32.07915573]
      }
    ],
    destination: [120.72816841, 30.75408188]
  },
  {
    id: "RktE73",
    name: "iPhone 16 Pro Max 1TB",
    price: 11177,
    createdAt: new Date(2025, 11, 17),
    sentAt: new Date(2025, 11, 18),
    status: "delivered",
    routes: [
      {
        time: new Date(2025, 11, 17),
        location: [121.42653336, 29.86982248]
      },
      {
        time: new Date(2025, 11, 17, 12),
        location: [120.08487785, 30.30987378]
      },
      {
        time: new Date(2025, 11, 18),
        location: [120.72816841, 30.75408188]
      },
    ],
    destination: [120.72816841, 30.75408188]
  },
  {
    id: "bS2rQ5",
    name: "iPhone 16 Plus 256GB",
    price: 6999,
    createdAt: new Date(2025, 11, 17),
    sentAt: new Date(2025, 11, 18),
    status: "received",
    routes: [
      {
        time: new Date(2025, 11, 17),
        location: [121.42653336, 29.86982248]
      },
      {
        time: new Date(2025, 11, 17, 12),
        location: [120.08487785, 30.30987378]
      },
      {
        time: new Date(2025, 11, 18),
        location: [120.72816841, 30.75408188]
      },
    ],
    destination: [120.72816841, 30.75408188]
  },
  {
    id: "e4Tr89",
    name: "iPhone 16 Plus 256GB",
    price: 6999,
    createdAt: new Date(2025, 11, 17),
    sentAt: new Date(2025, 11, 18),
    status: "cancelled",
    routes: [
      {
        time: new Date(2025, 11, 17),
        location: [121.42653336, 29.86982248]
      },
      {
        time: new Date(2025, 11, 17, 12),
        location: [120.08487785, 30.30987378]
      },
    ],
    destination: [120.72816841, 30.75408188]
  },
];
