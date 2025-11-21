import type { Request, Response } from "express";
import { mockPathsStore } from "types/mocks";
import { Controller, Get, Routable } from "../controller";

@Routable
export class PathsController extends Controller {
  @Get("/:id")
  getDeliveryPaths(req: Request, res: Response) {
    const id = req.params.id;
    if(!mockPathsStore.has(id)) {
      this.sendError(res, 404, "Cannot find the order");
      return;
    }

    this.sendResponse(res, {
      paths: mockPathsStore.get(id)
    });
  }
}
