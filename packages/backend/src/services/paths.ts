import { DeliveryPath } from "types";
import { db } from "../db";
import { geoLocationFromString } from "../utils";

export class PathsService {
  async getPathsByOrderId(orderId: string): Promise<DeliveryPath[] | null> {
    const order = await db.query("select * from orders where id = $1;", [orderId]);
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
}
