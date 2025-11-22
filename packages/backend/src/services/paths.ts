import { DeliveryPath, DeliveryPathSubmissionDTO } from "types";
import { db } from "../db";
import { geoLocationFromString } from "../utils";

export class PathsService {
  async getPathsByOrderId(orderId: string): Promise<DeliveryPath[] | null> {
    const order = await db.query("select * from orders where id = $1 order;", [orderId]);
    if(order.rows.length === 0) {
      return null;
    }
    
    const result = await db.query(
      "select * from delivery_paths where order_id = $1 order by time asc;",
      [orderId]
    );
    return result.rows.map((row: any) => ({
      time: new Date(row.time).getTime(),
      location: geoLocationFromString(row.location),
      action: row.action,
      claimCode: row.claim_code || undefined
    }));
  }

  async pushDeliveryPath(orderId: string, path: DeliveryPathSubmissionDTO) {
    await db.query(
      "insert into delivery_paths (order_id, time, location, action, claim_code) values ($1, to_timestamp($2 / 1000.0), $3, $4, $5);",
      [orderId, Date.now(), path.location, path.action, path.claimCode || null]
    );
  }
}
