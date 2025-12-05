import { getSegmentDistance, type GeoLocation } from "shared";
import ws from "ws";
import { Connectable, Endpoint, OnClose, OnError, OnOpen, type Session } from "@/endpoint";
import { OrdersService } from "@/services/orders";
import { PathsService } from "@/services/paths";
import { PointsService } from "@/services/points";
import { getRandom } from "@/utils";

const SIMULATED_VELOCITY = 300; // km / h

@Connectable("/routes/:id")
export class RoutesEndpoint extends Endpoint {
  private ordersService = new OrdersService();
  private pathsService = new PathsService();
  private pointsService = new PointsService();

  private timersMap: Map<string, NodeJS.Timeout> = new Map();
  private sessionsMap: Map<string, Set<Session>> = new Map();
  private cachedRoutes: Map<string, GeoLocation[]> = new Map();

  public constructor(wss: ws.Server) {
    super(wss);

    this.setupTimers();
    
    this.ordersService.on("create", (orderId) => this.createTimer(orderId));
    this.ordersService.on("delete", (orderId) => this.removeTimer(orderId));
  }

  private async setupTimers() {
    const orderIds = (await this.ordersService.getOrders()).map(({ id }) => id);
    orderIds.forEach((orderId) => this.createTimer(orderId));
  }

  private createTimer(orderId: string) {
    const action = async () => {
      const lastTimer = this.timersMap.get(orderId);
      if(lastTimer) clearTimeout(lastTimer);

      const nextMs = await this.updateAndBroadcast(orderId);
      if(nextMs !== null) this.timersMap.set(orderId, setTimeout(action, nextMs));
    };
    action();
  }

  private removeTimer(orderId: string) {
    if(!this.timersMap.has(orderId)) return;

    clearTimeout(this.timersMap.get(orderId));
    this.timersMap.delete(orderId);
  }

  private async updateAndBroadcast(orderId: string): Promise<number | null> {
    const orderStatus = await this.ordersService.getOrderStatus(orderId);
    if(orderStatus !== "delivering") return null;

    if(!this.cachedRoutes.has(orderId)) {
      this.cachedRoutes.set(orderId, await this.pointsService.readRoute(orderId));
    }
    const points = this.cachedRoutes.get(orderId);

    const { currentPointIndex } = await this.ordersService.getOrderById(orderId);
    const next = currentPointIndex + 1;
    const nextPoint = points[next];

    if(next === points.length) {
      this.ordersService.updateOrderStatus(orderId, "delivered");
      this.pathsService.pushDeliveryPath(orderId, {
        location: points[currentPointIndex],
        action: "已到货",
        claimCode: `${getRandom(100, 999)}-${getRandom(100, 999)}-${getRandom(100, 999)}`
      });
      return null;
    }

    this.ordersService.updateOrderLocation(orderId, nextPoint, next);

    if(next % 500 === 0) {
      this.pathsService.pushDeliveryPath(orderId, {
        location: nextPoint,
        action: "运输中"
      });
    }

    const nextNextPoint = points[next + 1];
    const distance = getSegmentDistance(nextPoint, nextNextPoint); // km
    const updateInterval = (distance / SIMULATED_VELOCITY) * 60 * 60 * 1000; // ms

    this.sessionsMap.forEach((sessions, id) => {
      if(sessions.size === 0 || id !== orderId) return;

      for(const session of sessions) {
        this.send(session, {
          type: "update",
          data: {
            currentPointIndex: next,
            updateInterval
          }
        });
      }
    });

    return updateInterval;
  }

  @OnOpen
  async onOpen(session: Session) {
    const orderId = session.params.id;
    if(!(await this.ordersService.getOrderById(orderId))) {
      session.close();
      return;
    }

    if(!this.sessionsMap.has(orderId)) {
      this.sessionsMap.set(orderId, new Set());
    }
    this.sessionsMap.get(orderId)?.add(session);

    if(!this.cachedRoutes.has(orderId)) {
      this.cachedRoutes.set(orderId, await this.pointsService.readRoute(orderId));
    }

    const { currentPointIndex } = await this.ordersService.getOrderById(orderId);
    this.send(session, {
      type: "init",
      data: {
        route: this.cachedRoutes.get(orderId),
        currentPointIndex
      }
    });
    this.send(session, {
      type: "update",
      data: {
        currentPointIndex,
        updateInterval: 1000
      }
    });
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
