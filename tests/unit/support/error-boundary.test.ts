import { readFileSync } from "node:fs";

import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import MarketingError from "@/app/(marketing)/error";

type ActionProps = { children?: ReactNode; href?: string; onClick?: () => void };

function findElement(
  node: ReactNode,
  predicate: (element: ReactElement<ActionProps>) => boolean,
): ReactElement<ActionProps> | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElement(child as ReactNode, predicate);
      if (match) return match;
    }
    return null;
  }
  if (!isValidElement(node)) return null;
  const element = node as ReactElement<ActionProps>;
  if (predicate(element)) return element;
  return findElement(element.props.children, predicate);
}

function visibleText(html: string): string {
  return html
    .replace(/<!--.*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// The error boundary keeps its user-visible contract, but it intentionally no
// longer composes `SupportStatePage`: doing so pulled the support stylesheet into
// every marketing route's render-blocking CSS. This asserts the rendered result
// and the reset wiring instead of a specific component tree.
describe("marketing runtime error boundary", () => {
  it("renders the approved error presentation with the artwork and a real home link", () => {
    const html = renderToStaticMarkup(
      MarketingError({ error: new Error("test error"), reset: vi.fn() }),
    );

    expect(visibleText(html)).toContain("Something Went Wrong");
    expect(html).toContain('src="/images/support/error-hero.webp"');
    expect(html).toContain('alt=""');
    expect(html).toContain('href="/"');
    expect(visibleText(html)).toContain("Try Again");
    expect(visibleText(html)).toContain("Back to Home");
  });

  it("does not reintroduce the support page stylesheet dependency", () => {
    const source = readFileSync(
      new URL("../../../src/app/(marketing)/error.tsx", import.meta.url),
      "utf8",
    );

    // Importing status-page.module.css here made that stylesheet part of every
    // marketing route's render-blocking CSS, so the boundary must stay self-contained.
    expect(source).not.toMatch(/from\s+"@\/components\/support\/status-page"/);
    expect(source).not.toMatch(/status-page\.module\.css"\)/);
  });

  it("uses the provided reset callback for the retry action", () => {
    const reset = vi.fn();
    const tree = MarketingError({ error: new Error("test error"), reset });

    const retry = findElement(tree, (element) => element.type === "button");
    expect(retry).not.toBeNull();
    expect(visibleText(renderToStaticMarkup(retry as ReactElement))).toBe("Try Again");
    expect(retry?.props.onClick).toBe(reset);

    retry?.props.onClick?.();
    expect(reset).toHaveBeenCalledOnce();
  });
});
