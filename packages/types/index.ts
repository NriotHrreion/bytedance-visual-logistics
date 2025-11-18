export type DeliveryStatus = "pending" | "delivering" | "delivered";

export type GeoLocation = [number, number];

export interface Order {
  id: string
  name: string
  createdAt: Date
  status: DeliveryStatus
  routes: GeoLocation[]
}
