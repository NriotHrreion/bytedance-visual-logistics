import ws from "ws";
import RouteParser from "route-parser";
import "reflect-metadata";

const ON_OPEN_METADATA_KEY = Symbol("onopen"); // string
const ON_MESSAGE_METADATA_KEY = Symbol("onmessage"); // MessageHandler[]
const ON_CLOSE_METADATA_KEY = Symbol("onclose"); // string
const ON_ERROR_METADATA_KEY = Symbol("onerror"); // string

interface MessageHandler {
  type: string
  handlerName: string
}

export interface MessagePacket<D> {
  type: string
  data: D
}

export type Session = ws.WebSocket & {
  params: { [x: string]: string }
};

export abstract class Endpoint {
  public constructor(public wss: ws.Server) { }

  protected send<D>(session: ws.WebSocket, packet: MessagePacket<D>) {
    session.send(JSON.stringify(packet));
  }

  protected broadcast<D>(packet: MessagePacket<D>) {
    this.wss.clients.forEach((session) => {
      this.send(session, packet);
    });
  }
}

export function Connectable(route: string) {
  return function<C extends { new(...args: any[]): {} }>(constructor: C) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(args);

        const wss: ws.Server = args[0];
        const onOpenMethod: string = Reflect.getMetadata(ON_OPEN_METADATA_KEY, constructor);
        const onMessageHandlers: MessageHandler[] = Reflect.getMetadata(ON_MESSAGE_METADATA_KEY, constructor);
        const onCloseMethod: string = Reflect.getMetadata(ON_CLOSE_METADATA_KEY, constructor);
        const onErrorMethod: string = Reflect.getMetadata(ON_ERROR_METADATA_KEY, constructor);

        wss.on("connection", (session, req) => {
          const routeParser = new RouteParser(route);
          const params = routeParser.match(URL.parse(req.url).pathname);
          if(!params) {
            session.close();
            return;
          }

          session.on("open", () => {
            this[onOpenMethod]({ ...session, params });
          });

          session.on("message", (msg: string) => {
            const packet = JSON.parse(msg) as MessagePacket<any>;
            for(const { type, handlerName } of onMessageHandlers) {
              if(type === packet.type) {
                this[handlerName]({ ...session, params }, packet.data);
                break;
              }
            }
          });

          session.on("close", () => {
            this[onCloseMethod]({ ...session, params });
          });

          session.on("error", (e) => {
            this[onErrorMethod]({ ...session, params }, e);
          });
        });
      }
    }
  }
}

export function OnOpen(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
  Reflect.defineMetadata(ON_OPEN_METADATA_KEY, propertyKey, target.constructor);
}

export function OnMessage(type: string): MethodDecorator {
  return (target, handlerName: string, descriptor) => {
    const handlers: MessageHandler[] = Reflect.getMetadata(ON_MESSAGE_METADATA_KEY, target.constructor) ?? [];
    handlers.push({
      type,
      handlerName
    });
    Reflect.defineMetadata(ON_MESSAGE_METADATA_KEY, handlers, target.constructor);
  }
}

export function OnClose(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
  Reflect.defineMetadata(ON_CLOSE_METADATA_KEY, propertyKey, target.constructor);
}

export function OnError(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
  Reflect.defineMetadata(ON_ERROR_METADATA_KEY, propertyKey, target.constructor);
}
