import { Connectable, Endpoint, OnClose, OnError, OnMessage, OnOpen, type Session } from "../endpoint";
import { PathsService } from "../services/paths";
import { PointsService } from "../services/points";

/** @todo */
@Connectable("/points/:id")
export class PointsEndpoint extends Endpoint {
  private pathsService = new PathsService();
  private pointsService = new PointsService();

  @OnOpen
  onOpen(session: Session) {

  }

  @OnClose
  onClose(session: Session) {

  }

  @OnError
  onError(session: Session, error: Error) {

  }
}
