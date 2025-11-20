export type DeliveryStatus = "pending" | "delivering" | "delivered" | "received" | "cancelled";

export type GeoLocation = [number, number];

export interface Order {
  id: string
  name: string
  createdAt: Date
  sentAt?: Date
  status: DeliveryStatus
  routes: {
    time: Date
    location: GeoLocation
  }[]
  destination: GeoLocation
}
