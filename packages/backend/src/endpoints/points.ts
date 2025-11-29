import type { GeoLocation } from "shared";
import ws from "ws";
import { Connectable, Endpoint, OnClose, OnError, OnOpen, type Session } from "@/endpoint";
import { OrdersService } from "@/services/orders";
import { PathsService } from "@/services/paths";
import { PointsService } from "@/services/points";
import { getRandom } from "@/utils";

const UPDATE_INTERVAL_MS = 3000;

@Connectable("/points/:id")
export class PointsEndpoint extends Endpoint {
  private ordersService = new OrdersService();
  private pathsService = new PathsService();
  private pointsService = new PointsService();

  private sessionsMap: Map<string, Set<Session>> = new Map();
  private cachedRoutes: Map<string, GeoLocation[]> = new Map();

  public constructor(wss: ws.Server) {
    super(wss);

    this.init();
  }

  private async init() {
    const orderIds = (await this.ordersService.getOrders()).map(({ id }) => id);
    for(const orderId of orderIds) {
      this.cachedRoutes.set(orderId, await this.pointsService.readRoute(orderId));
    }

    setInterval(() => {
      this.updateCurrentLocation();
      this.broadcastCurrentLocation();
    }, UPDATE_INTERVAL_MS);
  }

  private updateCurrentLocation() {
    this.cachedRoutes.forEach(async (points, orderId) => {
      const orderStatus = await this.ordersService.getOrderStatus(orderId);
      if(orderStatus !== "delivering") return;

      const currentPointIndex = await this.ordersService.getCurrentPointIndex(orderId);
      const next = currentPointIndex + 1;

      if(next === points.length) {
        this.ordersService.updateOrderStatus(orderId, "delivered");
        this.pathsService.pushDeliveryPath(orderId, {
          location: points[currentPointIndex],
          action: "已到货",
          claimCode: `${getRandom(100, 999)}-${getRandom(100, 999)}-${getRandom(100, 999)}`
        });
        return;
      }

      this.ordersService.updateOrderLocation(orderId, points[next], next);
    });
  }

  private broadcastCurrentLocation() {
    this.sessionsMap.forEach(async (sessions, orderId) => {
      if(sessions.size === 0) return;

      const order = await this.ordersService.getOrderById(orderId);
      for(const session of sessions) {
        this.send(session, { type: "route", data: order.current });
      }
    });
  }

  @OnOpen
  onOpen(session: Session) {
    const orderId = session.params.id;

    if(!this.sessionsMap.has(orderId)) {
      this.sessionsMap.set(orderId, new Set());
    }
    this.sessionsMap.get(orderId)?.add(session);
  }

  @OnClose
  onClose(session: Session) {
    const orderId = session.params.id;
    
    this.sessionsMap.get(orderId)?.delete(session);
  }

  @OnError
  onError(session: Session, error: Error) {
    const orderId = session.params.id;
    console.error(`WebSocket error on session subscribed to order ${orderId}:`, error);
  }
}
