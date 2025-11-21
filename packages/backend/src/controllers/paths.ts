import type { Request, Response } from "express";
import { mockPathsStore } from "types/mocks";
import { Controller, Get, Routable } from "../controller";
import { PathsService } from "../services/paths";

@Routable
export class PathsController extends Controller {
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
}
