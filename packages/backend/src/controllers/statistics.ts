import type { Request, Response } from "express";
import { getSegmentDistance, type StatisticsDTO } from "shared";
import { Controller, Get, Routable } from "@/controller";
import { OrdersService } from "@/services/orders";
import { PathsService } from "@/services/paths";
import { PointsService } from "@/services/points";

@Routable
export class StatisticsController extends Controller {
  private ordersService = OrdersService.get();
  private pathsService = PathsService.get();
  private pointsService = PointsService.get();

  @Get("/")
  async getStatistics(req: Request, res: Response) {
    const orders = await this.ordersService.getOrders();
    const ordersStatistics: StatisticsDTO["orders"] = [];

    let totalPrice = 0;
    let distanceSum = 0;
    let travelledTimeSum = 0;
    let travelledTimeCount = 0;

    for(const order of orders) {
      const paths = await this.pathsService.getPathsByOrderId(order.id) ?? [];
      if(paths.length === 0) continue;
      
      const status = order.status;
      const distance = getSegmentDistance(order.origin, order.destination);
      totalPrice += order.price;
      distanceSum += distance;

      switch(status) {
        case "pending":
          ordersStatistics.push({
            id: order.id,
            name: order.name,
            status,
            price: order.price,
            destination: order.destination,
            progress: 0
          });
          continue;
        case "delivering":
        case "delivered":
        case "received":
        case "cancelled":
          if(paths.length < 2) continue;
          
          const points = await this.pointsService.readRoute(order.id);
          const travelledDistance = getSegmentDistance(order.origin, points[order.currentPointIndex]);
          const travelledTime = paths[paths.length - 1].time - paths[1].time;

          ordersStatistics.push({
            id: order.id,
            name: order.name,
            status,
            price: order.price,
            destination: order.destination,
            progress: travelledDistance / distance
          });

          travelledTimeSum += travelledTime;
          travelledTimeCount++;
          continue;
      }
    }

    const averageDistance = orders.length > 0 ? distanceSum / orders.length : 0;
    const averageTravelledTime = travelledTimeCount > 0 ? travelledTimeSum / travelledTimeCount : 0;

    this.sendResponse(res, {
      orders: ordersStatistics,
      totalPrice,
      averageDistance,
      averageTravelledTime
    } satisfies StatisticsDTO);
  }
}
