export type DeliveryStatus = "pending" | "delivering" | "delivered" | "received" | "cancelled";

export type GeoLocation = [number, number]; // [longtitude, latitude]

export interface DeliveryPath {
  time: number
  location: GeoLocation
  action: string
  claimCode?: string
}

export type DeliveryPathSubmissionDTO = Omit<DeliveryPath, "time">;

export interface Order {
  id: string
  name: string
  price: number
  createdAt: number
  status: DeliveryStatus
  origin: GeoLocation
  destination: GeoLocation
  receiver: string
}

export type OrderInfoDTO = Order & {
  currentLocation?: GeoLocation
  claimCode?: string
}

export type OrderSubmissionDTO = Omit<Order, "id" | "status" | "createdAt">;

export type APIResponse<T> = T & {
  code: number
  error: string
};
