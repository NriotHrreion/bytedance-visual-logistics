import type { Order } from ".";

export const mockOrderList: Order[] = [
  {
    id: "eBdC32",
    name: "iPhone 17 Pro Max 2TB",
    createdAt: new Date(2025, 11, 18),
    status: "pending",
    routes: []
  },
  {
    id: "rAdC12",
    name: "iPhone 17 1TB",
    createdAt: new Date(2025, 11, 18),
    status: "delivering",
    routes: [
      [118.78221974, 32.07915573]
    ]
  },
  {
    id: "RktE73",
    name: "iPhone 16 Pro Max 1TB",
    createdAt: new Date(2025, 11, 18),
    status: "delivered",
    routes: [
      [120.08487785, 30.30987378]
    ]
  },
];
