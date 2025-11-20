import express, { Response, Router } from "express";
import "reflect-metadata";

const ROUTES_METADATA_KEY = Symbol("routes");

interface RouteHandler {
  path: string
  method: "get" | "post" | "put" | "patch" | "delete"
  handlerName: string
}

export abstract class Servlet {
  public router: Router = express.Router();

  protected sendOk(res: Response) {
    this.sendResponse(res, {});
  }

  protected sendResponse<T>(res: Response, json: T) {
    res.json({
      code: res.statusCode,
      message: "ok",
      ...json
    });
  }

  protected sendError(res: Response, code: number, message?: string) {
    res.status(code);
    if(message) res.statusMessage = message;
    res.json({
      code,
      message: message ?? res.statusMessage
    });
  }
}

export function Routable<C extends { new(...args: any[]): {} }>(constructor: C) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(args);

      const routes: RouteHandler[] = Reflect.getMetadata(ROUTES_METADATA_KEY, constructor) ?? [];
      for(const route of routes) {
        const handler = this[route.handlerName];
        if(typeof handler === "function" && route.handlerName !== "constructor") {
          try {
            (this as any as Servlet).router[route.method](route.path, handler.bind(this));
          } catch (e) {
            console.error(`Cannot register route "${route.handlerName}": ${e}`);
          }
        }
      }
    }
  }
}

function createRouteDecorator(method: RouteHandler["method"]) {
  return (path: string): MethodDecorator => {
    return (target, handlerName: string, descriptor) => {
      const routes: RouteHandler[] = Reflect.getMetadata(ROUTES_METADATA_KEY, target.constructor) ?? [];
      routes.push({
        path,
        method,
        handlerName
      });
      Reflect.defineMetadata(ROUTES_METADATA_KEY, routes, target.constructor);
    };
  };
}

export const Get = createRouteDecorator("get");
export const Post = createRouteDecorator("post");
export const Put = createRouteDecorator("put");
export const Patch = createRouteDecorator("patch");
export const Delete = createRouteDecorator("delete");
