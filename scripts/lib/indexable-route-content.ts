import { access } from "node:fs/promises";
import path from "node:path";

function normalizedRoute(route: string): string {
  if (!route.startsWith("/") || route.includes("..")) {
    throw new Error(`invalid public route: ${route}`);
  }
  return route === "/" ? "" : route.replace(/^\/+|\/+$/g, "");
}

export function dedicatedMarketingPagePath(route: string): string {
  return path.join("src", "app", "(marketing)", normalizedRoute(route), "page.tsx");
}

export async function hasDedicatedMarketingPage(route: string): Promise<boolean> {
  try {
    await access(dedicatedMarketingPagePath(route));
    return true;
  } catch {
    return false;
  }
}
