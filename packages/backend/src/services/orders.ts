import { DeliveryStatus, Order } from "types";
import { db } from "../db";
import {
  generateRandomString,
  geoLocationFromString,
  geoLocationToString
} from "../utils";

export class OrdersService {
  private rowToOrder(row: any): Order {
    return {
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      createdAt: new Date(row.created_at).getTime(),
      status: row.status,
      destination: geoLocationFromString(row.destination)
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

  async createOrder(order: Omit<Order, "id" | "status">): Promise<string> {
    const result = await db.query(
      "insert into orders (id, name, price, created_at, status, destination) values ($1, $2, $3, to_timestamp($4 / 1000.0), $5, $6);",
      [generateRandomString(12), order.name, order.price, Date.now(), "pending", geoLocationToString(order.destination)]
    );
    return result.rows[0].id;
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
