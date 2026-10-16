import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import MarketingError from "@/app/(marketing)/error";

type ActionProps = {
  children?: ReactNode;
  href?: string;
  onClick?: () => void;
};

describe("marketing runtime error boundary", () => {
  it("uses the provided reset callback and keeps a real home link", () => {
    const reset = vi.fn();
    const element = MarketingError({ error: new Error("test error"), reset });

    expect(isValidElement(element)).toBe(true);
    const page = element as ReactElement<{
      artwork: string;
      titlePrefix: string;
      titleAccent: string;
      actions: ReactNode;
    }>;
    expect(page.props.titlePrefix + page.props.titleAccent).toBe("Something Went Wrong");
    expect(page.props.artwork).toBe("/images/support/error-hero.webp");

    if (!isValidElement(page.props.actions)) throw new Error("error actions must be a fragment");
    const actionChildren = Children.toArray(
      (page.props.actions as ReactElement<{ children: ReactNode }>).props.children,
    ).filter(isValidElement) as ReactElement<ActionProps>[];

    const retry = actionChildren.find((child) => child.type === "button");
    expect(retry?.props.children).toBe("Try Again");
    expect(retry?.props.onClick).toBe(reset);
    retry?.props.onClick?.();
    expect(reset).toHaveBeenCalledOnce();

    const home = actionChildren.find((child) => child.props.href === "/");
    expect(home?.props.children).toBe("Back to Home");
  });
});
