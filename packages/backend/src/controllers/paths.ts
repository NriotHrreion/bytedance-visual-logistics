import type { Request, Response } from "express";
import type { DeliveryPathSubmissionDTO } from "types";
import { Controller, Get, Post, Routable } from "../controller";
import { OrdersService } from "../services/orders";
import { PathsService } from "../services/paths";

@Routable
export class PathsController extends Controller {
  private ordersService = new OrdersService();
  private pathsService = new PathsService();

  @Get("/:id")
  async getDeliveryPaths(req: Request, res: Response) {
    const id = req.params.id;
    const paths = await this.pathsService.getPathsByOrderId(id);
    if(!paths) {
      this.sendError(res, 404, "Cannot find the order");
      return;
    }

    this.sendResponse(res, { paths });
  }

  // @Post("/:id")
  // async pushDeliveryPath(req: Request, res: Response) {
  //   const id = req.params.id;
  //   const order = await this.ordersService.getOrderById(id);
  //   if(!order) {
  //     this.sendError(res, 404, "Cannot find the order");
  //     return;
  //   }

  //   const submittedPath: DeliveryPathSubmissionDTO = req.body;
  //   await this.pathsService.pushDeliveryPath(id, submittedPath);
  //   this.sendOk(res);
  // }
}
