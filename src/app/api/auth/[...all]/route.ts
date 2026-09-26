import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { toNextJsHandler } from "better-auth/next-js";

const nextJsHandlers = toNextJsHandler(auth);

function normalizeRequest(req: NextRequest): NextRequest {
  try {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/") && url.pathname.length > 1 && url.pathname.includes("/api/auth/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
      return new NextRequest(url.toString(), req);
    }
  } catch (e) {
    // Ignore URL parse error
  }
  return req;
}

export async function GET(req: NextRequest) {
  return nextJsHandlers.GET(normalizeRequest(req));
}

export async function POST(req: NextRequest) {
  return nextJsHandlers.POST(normalizeRequest(req));
}

export async function PATCH(req: NextRequest) {
  return nextJsHandlers.PATCH(normalizeRequest(req));
}

export async function PUT(req: NextRequest) {
  return nextJsHandlers.PUT(normalizeRequest(req));
}

export async function DELETE(req: NextRequest) {
  return nextJsHandlers.DELETE(normalizeRequest(req));
}
