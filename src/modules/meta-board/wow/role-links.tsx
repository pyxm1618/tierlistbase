"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { WOW_ROLES } from "../domain/wow-context";
import styles from "./wow-tier-list.module.css";
export function WowRoleLinks({
  availableRoles,
  currentRole,
  className,
}: {
  availableRoles: string[];
  currentRole: string | undefined;
  className?: string | undefined;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const roleHref = (role: string) =>
    `?role=${role}${className ? `&class=${encodeURIComponent(className)}` : ""}`;
  return (
    <nav className={styles.roleLinks} aria-label="Ranking Role" aria-busy={pending}>
      {WOW_ROLES.map((role) =>
        availableRoles.includes(role) ? (
          <a
            key={role}
            href={roleHref(role)}
            aria-current={role === currentRole ? "page" : undefined}
            aria-disabled={pending}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              if (!pending) startTransition(() => router.push(roleHref(role), { scroll: false }));
            }}
          >
            {role.toUpperCase()}
          </a>
        ) : (
          <span key={role} aria-disabled="true">
            {role.toUpperCase()}
          </span>
        ),
      )}
      {pending && <span role="status">Loading ranking context…</span>}
    </nav>
  );
}
