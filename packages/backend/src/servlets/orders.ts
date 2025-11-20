import type { Request, Response } from "express";
import { mockOrderList } from "types/mocks";
import { Get, Post, Routable, Servlet } from "../servlet";

@Routable
export class OrdersServlet extends Servlet {
  @Get("/list")
  getOrderList(req: Request, res: Response) {
    this.sendResponse(res, {
      orders: mockOrderList
    });
  }

  @Post("/add")
  createOrder(req: Request, res: Response) {
    this.sendOk(res);
  }
}
