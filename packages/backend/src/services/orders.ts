import type { DeliveryStatus, GeoLocation, Order, OrderSubmissionDTO } from "shared";
import EventEmitter from "events";
import { db } from "@/db";
import {
  deserializeGeoLocation,
  generateRandomString,
  serializeGeoLocation,
} from "@/utils";

export class OrdersService extends EventEmitter<{
  deliver: [string],
  receive: [string],
  cancel: [string],
  delete: [string]
}> {
  private static instance: OrdersService;

  private constructor() {
    super();
  }

  public static get(): OrdersService {
    if(!OrdersService.instance) {
      OrdersService.instance = new OrdersService();
    }
    return OrdersService.instance;
  }

  private rowToOrder(row: any): Order {
    return {
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      createdAt: new Date(row.created_at).getTime(),
      status: row.status,
      origin: deserializeGeoLocation(row.origin),
      destination: deserializeGeoLocation(row.destination),
      receiver: row.receiver,
      current: deserializeGeoLocation(row.current),
      currentPointIndex: row.current_point_index
    };
  }

  async getOrders(): Promise<Order[]> {
    const result = await db.query("select * from orders;");
    return result.rows.map(this.rowToOrder);
  }

  async getOrderById(id: string): Promise<Order | null> {
    const result = await db.query("select * from orders where id = $1;", [id]);
    if(result.rows.length === 0) {
      return null;
    }
    return this.rowToOrder(result.rows[0]);
  }

  async createOrder(order: OrderSubmissionDTO): Promise<string> {
    const id = generateRandomString(12);
    await db.query(
      "insert into orders (id, name, price, created_at, status, origin, destination, receiver, current, current_point_index) values ($1, $2, $3, to_timestamp($4 / 1000.0), $5, $6, $7, $8, $9, $10);",
      [id, order.name, order.price, Date.now(), "pending", serializeGeoLocation(order.origin), serializeGeoLocation(order.destination), order.receiver, serializeGeoLocation(order.origin), 0]
    );
    return id;
  }

  async deleteOrder(id: string) {
    await db.query("delete from orders where id = $1;", [id]);
    this.emit("delete", id);
  }

  async getOrderStatus(id: string): Promise<DeliveryStatus | null> {
    const result = await db.query("select status from orders where id = $1;", [id]);
    if(result.rows.length === 0) {
      return null;
    }
    return result.rows[0].status;
  }

  async updateOrderStatus(id: string, status: DeliveryStatus) {
    await db.query("update orders set status = $1 where id = $2;", [status, id]);
    if(status === "delivering") this.emit("deliver", id);
    if(status === "received") this.emit("receive", id);
    if(status === "cancelled") this.emit("cancel", id);
  }

  async updateOrderLocation(id: string, location: GeoLocation, currentPointIndex: number) {
    await db.query("update orders set current = $1 where id = $2;", [serializeGeoLocation(location), id]);
    await db.query("update orders set current_point_index = $1 where id = $2;", [currentPointIndex, id]);
  }
}
