import type { GeoLocation } from "shared";
import { backendBase } from "../global";
import { WebSocketClient } from ".";

export class RealtimeRouteClient extends WebSocketClient<{
  "init-route": [GeoLocation[], number]
  "update-route": [number, number]
}> {
  public constructor(orderId: string) {
    super(`ws://${backendBase}/routes/${orderId}`);
  }

  override onOpen() { }

  override onMessage(type: string, data: any) {
    switch(type) {
      case "init":
        this.emit("init-route", data.route, data.currentPointIndex);
        break;
      case "update":
        this.emit("update-route", data.currentPointIndex, data.updateInterval);
        break;
    }
  }

  override onClose() { }

  override onError(e: Event) {
    console.error(`WebSocket Error (${this.ws.url}): `, e);
  }
}
