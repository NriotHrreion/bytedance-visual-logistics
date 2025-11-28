import { DeliveryStatus, Order, OrderSubmissionDTO } from "shared";
import { db } from "@/db";
import {
  deserializeGeoLocation,
  generateRandomString,
  serializeGeoLocation,
} from "@/utils";

export class OrdersService {
  private rowToOrder(row: any): Order {
    return {
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      createdAt: new Date(row.created_at).getTime(),
      status: row.status,
      origin: deserializeGeoLocation(row.origin),
      destination: deserializeGeoLocation(row.destination),
      current: deserializeGeoLocation(row.current),
      receiver: row.receiver
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
      "insert into orders (id, name, price, created_at, status, origin, destination, current, receiver) values ($1, $2, $3, to_timestamp($4 / 1000.0), $5, $6, $7, $8, $9);",
      [id, order.name, order.price, Date.now(), "pending", serializeGeoLocation(order.origin), serializeGeoLocation(order.destination), serializeGeoLocation(order.origin), order.receiver]
    );
    return id;
  }

  async deleteOrder(id: string) {
    await db.query("delete from orders where id = $1;", [id]);
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
  }
}
