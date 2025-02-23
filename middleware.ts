import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import config from "./config";

interface AuthObject {
  userId: string | null;
  redirectToSignIn: () => NextResponse;
}

interface ClerkMiddleware {
  (handler: (auth: () => Promise<AuthObject>, req: NextRequest) => Promise<NextResponse>): (req: NextRequest) => Promise<NextResponse>;
}

interface ClerkModules {
  clerkMiddleware: ClerkMiddleware;
  createRouteMatcher: (patterns: string[]) => (req: NextRequest) => boolean;
}

let clerkMiddleware: ClerkMiddleware | undefined;
let createRouteMatcher: ((patterns: string[]) => (req: NextRequest) => boolean) | undefined;

if (config.auth.enabled) {
  try {
    const modules = require("@clerk/nextjs/server") as ClerkModules;
    ({ clerkMiddleware, createRouteMatcher } = modules);
  } catch (error) {
    console.warn("Clerk modules not available. Auth will be disabled.");
    config.auth.enabled = false;
  }
}

const isProtectedRoute = config.auth.enabled && createRouteMatcher
  ? createRouteMatcher(["/dashboard(.*)"])
  : () => false;

export default function middleware(req: NextRequest) {
  if (config.auth.enabled && clerkMiddleware) {
    return clerkMiddleware(async (auth: () => Promise<AuthObject>, req: NextRequest) => {
      const resolvedAuth = await auth();

      if (!resolvedAuth.userId && isProtectedRoute(req)) {
        return resolvedAuth.redirectToSignIn();
      } else {
        return NextResponse.next();
      }
    })(req);
  } else {
    return NextResponse.next();
  }
}

export const middlewareConfig = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};