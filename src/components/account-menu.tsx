"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getInitials } from "@/lib/account";
import { useAuth } from "./auth";
import {
  ChevronDown,
  Heart,
  LogOut,
  Package,
  Settings,
  User,
} from "./icons";

type AccountMenuProps = {
  variant?: "desktop" | "mobile";
};

function MenuLink({
  href,
  icon,
  children,
  onSelect,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-ink/70 transition-colors hover:bg-beige/60 hover:text-ink"
    >
      <span className="text-ink/40">{icon}</span>
      {children}
    </Link>
  );
}

export function AccountMenu({ variant = "desktop" }: AccountMenuProps) {
  const pathname = usePathname();
  const { user, hydrated, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = `account-menu-${variant}`;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);
  const signedIn = hydrated && user;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={signedIn ? `Account menu for ${user.name}` : "Account menu"}
        title="Account"
        className={
          variant === "desktop"
            ? "flex h-10 items-center gap-1 rounded-full px-1 text-ink/65 transition-colors hover:bg-beige/60 hover:text-ink"
            : "grid h-10 w-10 place-items-center rounded-full text-ink/70 transition-colors hover:bg-beige/60 hover:text-ink"
        }
      >
        {signedIn ? (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-olive font-heading text-[10px] font-bold tracking-wide text-cream">
            {getInitials(user.name)}
          </span>
        ) : (
          <User className="h-[18px] w-[18px]" />
        )}
        {variant === "desktop" && (
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className={`panel-in absolute right-0 top-full z-50 mt-2 rounded-2xl border border-line bg-cream p-2 shadow-[0_24px_60px_-36px_rgba(32,31,28,0.65)] ${
            variant === "desktop"
              ? "w-[300px]"
              : "w-[min(18rem,calc(100vw_-_2rem))]"
          }`}
        >
          {!hydrated ? (
            <p className="px-3 py-4 text-[12px] text-ink/45">
              Loading your account…
            </p>
          ) : signedIn ? (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-beige/55 px-3 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-olive font-heading text-[11px] font-bold text-cream">
                  {getInitials(user.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-heading text-[12px] font-bold text-ink">
                    {user.name}
                  </span>
                  <span className="block truncate text-[10px] text-ink/45">
                    {user.email}
                  </span>
                </span>
              </div>

              <div className="mt-2 space-y-0.5">
                <MenuLink href="/account" icon={<User className="h-4 w-4" />} onSelect={close}>
                  My account
                </MenuLink>
                <MenuLink
                  href="/account?tab=orders"
                  icon={<Package className="h-4 w-4" />}
                  onSelect={close}
                >
                  My orders
                </MenuLink>
                <MenuLink
                  href="/wishlist"
                  icon={<Heart className="h-4 w-4" />}
                  onSelect={close}
                >
                  My wishlist
                </MenuLink>
                <MenuLink
                  href="/account?tab=settings"
                  icon={<Settings className="h-4 w-4" />}
                  onSelect={close}
                >
                  Account settings
                </MenuLink>
              </div>

              <div className="my-2 h-px bg-line" />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  signOut();
                  close();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12px] font-medium text-ink/60 transition-colors hover:bg-beige/60 hover:text-ink"
              >
                <LogOut className="h-4 w-4 text-ink/40" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-2">
                <p className="font-heading text-[13px] font-bold text-ink">
                  Your account
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-ink/45">
                  Sign in for orders, saved pieces and account details.
                </p>
              </div>

              <div className="mt-1 space-y-2 px-1 pb-1">
                <Link
                  href="/account/sign-in"
                  role="menuitem"
                  onClick={close}
                  className="flex h-10 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-cream transition-colors hover:bg-olive"
                >
                  Sign in
                </Link>
                <Link
                  href="/account/create-account"
                  role="menuitem"
                  onClick={close}
                  className="flex h-10 items-center justify-center rounded-full border border-line bg-cream text-[12px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-beige/60"
                >
                  Create account
                </Link>
              </div>

              <div className="my-1 h-px bg-line" />

              <MenuLink
                href="/wishlist"
                icon={<Heart className="h-4 w-4" />}
                onSelect={close}
              >
                View wishlist
              </MenuLink>
            </>
          )}
        </div>
      )}
    </div>
  );
}
