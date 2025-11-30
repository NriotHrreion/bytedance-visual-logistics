import type { MessagePacket } from "shared";
import EventEmitter from "events";

/** @see `@types/node` events.d.ts */
type EventMap<T> = Record<keyof T, any[]> | [never];

export abstract class WebSocketClient<E extends EventMap<E>> extends EventEmitter<E | {
  open: []
  close: []
  error: [Event]
}> {
  protected readonly ws: WebSocket;

  protected constructor(url: string) {
    super();

    this.ws = new WebSocket(url);
    this.ws.addEventListener("open", () => {
      this.onOpen();
      this.emit("open");
    });
    this.ws.addEventListener("message", (e) => {
      const { type, data } = JSON.parse(e.data) as MessagePacket<any>;
      this.onMessage(type, data);
    });
    this.ws.addEventListener("close", () => {
      this.onClose();
      this.emit("close");
    });
    this.ws.addEventListener("error", (e) => {
      this.onError(e);
      this.emit("error", e);
    });
  }

  protected abstract onOpen(): void;
  protected abstract onMessage(type: string, data: any): void;
  protected abstract onClose(): void;
  protected abstract onError(e: Event): void;

  public close(): void {
    this.ws.close();
  }
}
