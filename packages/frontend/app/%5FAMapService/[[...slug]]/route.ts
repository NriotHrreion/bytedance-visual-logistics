import https from "https";
import { NextRequest, NextResponse } from "next/server";
import { amapRestAPIBase, amapWebAPIBase } from "@/lib/global";

async function proxyRequest(req: NextRequest, method: string) {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace("/_AMapService", "");
  url.protocol = "https:";
  url.hostname = url.pathname === "/v4/map/styles" ? amapWebAPIBase : amapRestAPIBase;
  url.port = "";
  url.searchParams.append("jscode", process.env["AMAP_API_SECRET"]);

  const res = await fetch(url.toString(), {
    method,
    headers: Object.fromEntries(req.headers.entries()),
    body: method !== "GET" && method !== "HEAD" ? await req.text() : undefined,
  });

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: Object.fromEntries(req.headers.entries())
  });
}

export async function GET(req: NextRequest) {
  return await proxyRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return await proxyRequest(req, "POST");
}

export async function PUT(req: NextRequest) {
  return await proxyRequest(req, "PUT");
}

export async function PATCH(req: NextRequest) {
  return await proxyRequest(req, "PATCH");
}

export async function DELETE(req: NextRequest) {
  return await proxyRequest(req, "DELETE");
}
