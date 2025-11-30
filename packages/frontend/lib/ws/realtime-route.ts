import type { GeoLocation } from "shared";
import { backendBase } from "../global";
import { WebSocketClient } from ".";

export class RealtimeRouteClient extends WebSocketClient<{
  "init-route": [GeoLocation[]]
  "update-route": [GeoLocation]
}> {
  public constructor(orderId: string) {
    super(`ws://${backendBase}/routes/${orderId}`);
  }

  override onOpen() { }

  override onMessage(type: string, data: any) {
    switch(type) {
      case "init":
        this.emit("init-route", data);
        break;
      case "route":
        this.emit("update-route", data);
        break;
    }
  }

  override onClose() { }

  override onError(e: Event) {
    console.error(`WebSocket Error (${this.ws.url}): `, e);
  }
}
