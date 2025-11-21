export type DeliveryStatus = "pending" | "delivering" | "delivered" | "received" | "cancelled";

export type GeoLocation = [number, number];

export interface DeliveryPath {
  time: number
  location: GeoLocation
  action: string
  claimCode?: string
}

export interface Order {
  id: string
  name: string
  price: number
  createdAt: number
  sentAt?: number
  status: DeliveryStatus
  destination: GeoLocation
  currentLocation?: GeoLocation
  claimCode?: string
}

export type APIResponse<T> = T & {
  code: number
  error: string
};
