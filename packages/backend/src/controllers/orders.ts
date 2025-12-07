import type { Request, Response } from "express";
import "@/env-config";
import { amapServiceKey, amapRestAPI, GeoLocation, type OrderInfoDTO, type OrderSubmissionDTO, getSegmentDistance } from "shared";
import { Get, Post, Routable, Controller, Delete } from "@/controller";
import { OrdersService } from "@/services/orders";
import { PathsService } from "@/services/paths";
import { PointsService } from "@/services/points";

@Routable
export class OrdersController extends Controller {
  private ordersService = OrdersService.get();
  private pathsService = PathsService.get();
  private pointsService = PointsService.get();

  @Get("/")
  async getOrderList(req: Request, res: Response) {
    const orderList = await this.ordersService.getOrders();
    const orderDTOList: OrderInfoDTO[] = [];

    for(const order of orderList) {
      const paths = await this.pathsService.getPathsByOrderId(order.id) ?? [];
      orderDTOList.push({
        ...order,
        claimCode: paths[paths.length - 1]?.claimCode,
        routeLength: await this.pointsService.getRouteLength(order.id)
      });
    }

    this.sendResponse(res, { orders: orderDTOList });
  }

  @Get("/:id")
  async getOrder(req: Request, res: Response) {
    const id = req.params.id;
    const order = await this.ordersService.getOrderById(id);
    if(!order) {
      this.sendError(res, 404, "Cannot find the order");
      return;
    }

    const paths = await this.pathsService.getPathsByOrderId(order.id) ?? [];
    this.sendResponse(res, {
      order: {
        ...order,
        claimCode: paths[paths.length - 1]?.claimCode,
        routeLength: await this.pointsService.getRouteLength(order.id)
      } satisfies OrderInfoDTO
    });
  }

  @Post("/")
  async createOrder(req: Request, res: Response) {
    const submittedOrder: OrderSubmissionDTO = req.body;
    const { origin, destination } = submittedOrder;
    const newOrderId: string = await this.ordersService.createOrder(submittedOrder);
    await this.pathsService.pushDeliveryPath(newOrderId, {
      location: origin,
      action: "订单已创建"
    });
    this.sendResponse(res, { id: newOrderId });

    /** @see https://lbs.amap.com/api/webservice/guide/api/direction#t6 */
    const { data } = await amapRestAPI.get(`/v3/direction/driving?key=${amapServiceKey}&origin=${origin.join(",")}&destination=${destination.join(",")}&extensions=base`);
    const steps = data.route.paths[0].steps;
    const pointsMap = new Map<string, GeoLocation>(); // to deduplicate
    for(const step of steps) {
      const polyline: string = step.polyline;
      polyline.split(";").forEach((str) => {
        const point = str.split(",").map(parseFloat) as GeoLocation;
        pointsMap.set(str, point);
      });
    }
    const points = Array.from(pointsMap.values());
    this.pointsService.storeMockRoute(newOrderId, points);
  }

  @Delete("/:id")
  async deleteOrder(req: Request, res: Response) {
    const id = req.params.id;
    await this.ordersService.deleteOrder(id);
    this.sendOk(res);
  }

  @Post("/:id/deliver")
  async deliverOrder(req: Request, res: Response) {
    const id = req.params.id;
    const order = await this.ordersService.getOrderById(id);
    if(!order) {
      this.sendError(res, 404, "Cannot find the order");
      return;
    }

    if(await this.ordersService.getOrderStatus(id) !== "pending") {
      this.sendError(res, 400, "The order is not pending delivery");
      return;
    }

    await this.ordersService.updateOrderStatus(id, "delivering");

    await this.pathsService.pushDeliveryPath(id, {
      location: order.origin,
      action: "已发货"
    });
    this.sendOk(res);
  }

  @Post("/:id/receive")
  async receiveOrder(req: Request, res: Response) {
    const id = req.params.id;
    const order = await this.ordersService.getOrderById(id);
    if(!order) {
      this.sendError(res, 404, "Cannot find the order");
      return;
    }

    const status = await this.ordersService.getOrderStatus(id);
    if(status === "pending" || status === "cancelled") {
      this.sendError(res, 400, "The order is pending delivery or has been cancelled");
      return;
    }

    await this.ordersService.updateOrderStatus(id, "received");

    await this.pathsService.pushDeliveryPath(id, {
      location: order.destination,
      action: "已签收"
    });
    this.sendOk(res);
  }

  @Post("/:id/cancel")
  async cancelOrder(req: Request, res: Response) {
    const id = req.params.id;
    const order = await this.ordersService.getOrderById(id);
    if(!order) {
      this.sendError(res, 404, "Cannot find the order");
      return;
    }
    
    await this.ordersService.updateOrderStatus(id, "cancelled");

    const paths = await this.pathsService.getPathsByOrderId(id);
    await this.pathsService.pushDeliveryPath(id, {
      location: paths ? paths[paths.length - 1].location : [0, 0],
      action: "已取消"
    });
    this.sendOk(res);
  }
}
