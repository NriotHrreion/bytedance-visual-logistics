import type { GeoLocation } from "shared";
import { db } from "@/db";
import { deserializeGeoLocation, serializeGeoLocation } from "@/utils";

export class PointsService {
  async storeMockRoute(orderId: string, points: GeoLocation[]) {
    const order = await db.query("select * from orders where id = $1;", [orderId]);
    if(order.rows.length === 0) {
      throw new Error("Cannot find the order");
    }

    if(await this.existsRoute(orderId)) {
      throw new Error("Order route points have already been stored.");
    }

    for(let i = 0; i < points.length; i++) {
      db.query(
        "insert into route_points (order_id, sequence_number, location) values ($1, $2, $3);",
        [orderId, i, serializeGeoLocation(points[i])]
      );
    }
  }

  async existsRoute(orderId: string) {
    const points = await db.query("select * from route_points where order_id = $1 limit 1;", [orderId]);
    return points.rowCount === 1;
  }

  async readRoute(orderId: string): Promise<GeoLocation[]> {
    const order = await db.query("select * from orders where id = $1;", [orderId]);
    if(order.rows.length === 0) {
      throw new Error("Cannot find the order");
    }

    const points = await db.query("select * from route_points where order_id = $1 order by sequence_number asc;", [orderId]);
    return points.rows.map(({ location }) => deserializeGeoLocation(location));
  }

  async getRouteLength(orderId: string): Promise<number> {
    const result = await db.query("select COUNT(*) as count from route_points where order_id = $1;", [orderId]);
    return parseInt(result.rows[0].count);
  }
}
