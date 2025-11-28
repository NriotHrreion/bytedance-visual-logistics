import { Connectable, Endpoint, OnClose, OnError, OnOpen, type Session } from "@/endpoint";
import { PathsService } from "@/services/paths";
import { PointsService } from "@/services/points";

const BROADCAST_INTERVAL_MS = 3000;

@Connectable("/points/:id")
export class PointsEndpoint extends Endpoint {
  private pathsService = new PathsService();
  private pointsService = new PointsService();

  private sessionsMap: Map<string, Set<Session>> = new Map();
  private timer: NodeJS.Timeout | null = null;

  private async broadcastCurrentLocation() {
    this.broadcast({ type: "test", data: "hello" });
  }

  @OnOpen
  onOpen(session: Session) {
    const orderId = session.params.id;

    if(!this.sessionsMap.has(orderId)) {
      this.sessionsMap.set(orderId, new Set());
    }
    this.sessionsMap.get(orderId)?.add(session);

    if(this.wss.clients.size === 1) {
      this.timer = setInterval(() => {
        this.broadcastCurrentLocation();
      }, BROADCAST_INTERVAL_MS);
    }
  }

  @OnClose
  onClose(session: Session) {
    const orderId = session.params.id;
    
    this.sessionsMap.get(orderId)?.delete(session);

    if(this.wss.clients.size === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  @OnError
  onError(session: Session, error: Error) {
    const orderId = session.params.id;
    console.error(`WebSocket error on session subscribed to order ${orderId}:`, error);
  }
}
