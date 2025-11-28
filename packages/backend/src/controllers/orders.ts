import type { Request, Response } from "express";
import type { OrderInfoDTO, OrderSubmissionDTO } from "types";
import { Get, Post, Routable, Controller, Delete } from "../controller";
import { OrdersService } from "../services/orders";
import { PathsService } from "../services/paths";
import { getRandom } from "../utils";

@Routable
export class OrdersController extends Controller {
  private ordersService = new OrdersService();
  private pathsService = new PathsService();

  @Get("/")
  async getOrderList(req: Request, res: Response) {
    const orderList = await this.ordersService.getOrders();
    const orderDTOList: OrderInfoDTO[] = [];

    for(const order of orderList) {
      const paths = await this.pathsService.getPathsByOrderId(order.id) ?? [];
      orderDTOList.push({
        ...order,
        currentLocation: paths[paths.length - 1]?.location,
        claimCode: paths[paths.length - 1]?.claimCode
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
        currentLocation: paths[paths.length - 1]?.location,
        claimCode: paths[paths.length - 1]?.claimCode
      } as OrderInfoDTO
    });
  }

  @Post("/")
  async createOrder(req: Request, res: Response) {
    const submittedOrder: OrderSubmissionDTO = req.body;
    const newOrderId: string = await this.ordersService.createOrder(submittedOrder);
    await this.pathsService.pushDeliveryPath(newOrderId, {
      location: submittedOrder.origin,
      action: "订单已创建"
    });
    this.sendResponse(res, { id: newOrderId });

    /** @todo */
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

  @Post("/:id/delivered")
  async orderDelivered(req: Request, res: Response) {
    const id = req.params.id;
    const order = await this.ordersService.getOrderById(id);
    if(!order) {
      this.sendError(res, 404, "Cannot find the order");
      return;
    }

    if(await this.ordersService.getOrderStatus(id) !== "delivering") {
      this.sendError(res, 400, "The order is not in delivering status");
      return;
    }

    await this.ordersService.updateOrderStatus(id, "delivered");

    await this.pathsService.pushDeliveryPath(id, {
      location: order.destination,
      action: "已到货",
      claimCode: `${getRandom(100, 999)}-${getRandom(100, 999)}-${getRandom(100, 999)}`
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
