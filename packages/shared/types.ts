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
  current: GeoLocation
  currentPointIndex: number
}

export type OrderInfoDTO = Order & {
  claimCode?: string
  routeLength: number
}

export type OrderSubmissionDTO = Omit<Order, "id" | "status" | "createdAt" | "current">;

export interface StatisticsDTO {
  orders: {
    id: string
    name: string
    status: DeliveryStatus
    price: number
    destination: GeoLocation
    progress: number
  }[]
  totalPrice: number
  averageDistance: number
  averageTravelledTime: number
}

export type APIResponse<T> = T & {
  code: number
  error: string
};

export interface MessagePacket<D> {
  type: string
  data: D
}
