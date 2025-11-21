import type { Request, Response } from "express";
import { mockOrderList, mockPathsStore } from "types/mocks";
import { Get, Post, Routable, Controller, Delete } from "../controller";
import { Order } from "types";
import { generateRandomString } from "../utils";

@Routable
export class OrdersController extends Controller {
  @Get("/")
  getOrderList(req: Request, res: Response) {
    this.sendResponse(res, {
      orders: mockOrderList.map((order) => {
        const paths = mockPathsStore.get(order.id) ?? [];
        return {
          ...order,
          currentLocation: paths[paths.length - 1]?.location,
          claimCode: paths[paths.length - 1]?.claimCode
        } as Order;
      })
    });
  }

  @Get("/:id")
  getOrder(req: Request, res: Response) {
    const id = req.params.id;
    const order = mockOrderList.find(({ id: _id }) => _id === id);
    if(!order) {
      this.sendError(res, 404, "Cannot find the order");
      return;
    }

    const paths = mockPathsStore.get(order.id) ?? [];
    this.sendResponse(res, {
      order: {
        ...order,
        currentLocation: paths[paths.length - 1]?.location,
        claimCode: paths[paths.length - 1]?.claimCode
      } as Order
    });
  }

  @Post("/")
  createOrder(req: Request, res: Response) {
    const submittedOrder: Omit<Order, "id"> = req.body;
    const newOrder: Order = {
      id: generateRandomString(6),
      ...submittedOrder
    };

    /** @todo */

    this.sendResponse(res, {
      id: newOrder.id
    });
  }

  @Delete("/:id")
  deleteOrder(req: Request, res: Response) {
    const id = req.params.id;

    /** @todo */

    this.sendOk(res);
  }

  @Post("/:id/deliver")
  deliverOrder(req: Request, res: Response) {
    const id = req.params.id;

    /** @todo */

    this.sendOk(res);
  }

  @Post("/:id/receive")
  receiveOrder(req: Request, res: Response) {
    const id = req.params.id;

    /** @todo */

    this.sendOk(res);
  }

  @Post("/:id/cancel")
  cancelOrder(req: Request, res: Response) {
    const id = req.params.id;

    /** @todo */

    this.sendOk(res);
  }
}
