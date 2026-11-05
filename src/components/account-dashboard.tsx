"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { getInitials, isValidEmail } from "@/lib/account";
import { useAuth, type AccountUser } from "./auth";
import {
  ArrowRight,
  Check,
  Heart,
  LogOut,
  Package,
  Pencil,
  Settings,
  Shield,
  User,
} from "./icons";
import { ProductCard } from "./product-card";
import { useStore } from "./store";
import {
  authErrorClass,
  authInputClass,
  authLabelClass,
} from "./auth/auth-styles";

type Tab = "profile" | "orders" | "wishlist" | "settings";

const tabs: {
  id: Tab;
  label: string;
  icon: ReactNode;
}[] = [
  { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  { id: "orders", label: "Orders", icon: <Package className="h-4 w-4" /> },
  { id: "wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

function isTab(value: string | null): value is Tab {
  return (
    value === "profile" ||
    value === "orders" ||
    value === "wishlist" ||
    value === "settings"
  );
}

function AccountLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <div className="h-3 w-24 animate-pulse rounded-full bg-beige" />
      <div className="mt-3 h-9 w-64 animate-pulse rounded-xl bg-beige" />
      <div className="mt-8 grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <div className="h-64 animate-pulse rounded-2xl border border-line bg-white/40" />
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-white/40" />
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-line/80 bg-cream/70 px-4 py-3.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/35">
        {label}
      </p>
      <p className="mt-1.5 truncate text-[12px] font-medium text-ink">
        {value}
      </p>
      {note && <p className="mt-0.5 text-[10px] text-ink/40">{note}</p>}
    </div>
  );
}

function ProfilePanel({ user }: { user: AccountUser }) {
  const { updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSaved(false);

    const next: { name?: string; email?: string } = {};

    if (name.trim().length < 2) {
      next.name = "Enter your full name.";
    }

    if (!email.trim()) {
      next.email = "Enter your email address.";
    } else if (!isValidEmail(email)) {
      next.email = "Enter a valid email address.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const result = await updateProfile(name, email);

    if (!result.ok) {
      if (result.field === "name" || result.field === "email") {
        setErrors((current) => ({
          ...current,
          [result.field as "name" | "email"]: result.message,
        }));
      } else {
        setFormError(result.message);
      }

      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
    setSaved(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-olive font-heading text-xl font-bold tracking-wide text-cream">
            {getInitials(user.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-heading text-xl font-bold text-ink">
                {user.name}
              </h2>
              <span className="rounded-full bg-beige/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                Member
              </span>
            </div>
            <p className="mt-0.5 truncate text-[12px] text-ink/45">
              {user.email}
            </p>
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setSaved(false);
            }}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-line bg-cream px-4 text-[11px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-beige/60"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit profile
          </button>
        )}
      </div>

      {saved && (
        <p
          role="status"
          className="mt-4 flex items-center gap-1.5 rounded-xl bg-beige/55 px-3 py-2 text-[11px] text-ink/55"
        >
          <Check className="h-3.5 w-3.5 text-olive" />
          Profile updated.
        </p>
      )}

      {editing ? (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-4 rounded-xl border border-line bg-cream/70 p-4"
        >
          <div>
            <label htmlFor="profile-name" className={authLabelClass}>
              Full name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setFormError("");
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              className={`${authInputClass} ${
                errors.name ? "border-ink/50" : ""
              }`}
            />
            {errors.name && <p className={authErrorClass}>{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="profile-email" className={authLabelClass}>
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFormError("");
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              className={`${authInputClass} ${
                errors.email ? "border-ink/50" : ""
              }`}
            />
            {errors.email && <p className={authErrorClass}>{errors.email}</p>}
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-ink/10 bg-beige/60 px-3 py-2.5 text-[11px] leading-relaxed text-ink/70"
            >
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setName(user.name);
                setEmail(user.email);
                setErrors({});
                setFormError("");
              }}
              className="h-10 rounded-full border border-line bg-cream px-5 text-[11px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-beige/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className="h-10 rounded-full bg-ink px-5 text-[11px] font-semibold text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Detail label="Full name" value={user.name} />
          <Detail label="Email address" value={user.email} />
          <Detail
            label="Account status"
            value="Signed in"
            note="Secure server session"
          />
          <Detail
            label="Storage"
            value="Server account"
            note="Your details are stored with this store"
          />
        </div>
      )}

      <div className="mt-6 rounded-xl border border-line/80 bg-beige/35 p-4">
        <p className="text-[11px] leading-relaxed text-ink/50">
          Your profile details are stored on the store server. Passwords are
          salted and hashed, and sign-in sessions are kept in a secure
          HTTP-only cookie.
        </p>
      </div>
    </div>
  );
}

function OrdersPanel() {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-ink">My orders</h2>
      <p className="mt-1 text-[12px] text-ink/45">
        Keep track of purchases and delivery details.
      </p>

      <div className="mt-6 rounded-xl border border-dashed border-line bg-cream/60 px-6 py-12 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-beige/70 text-ink/45">
          <Package className="h-5 w-5" />
        </span>
        <h3 className="mt-3 font-heading text-base font-bold text-ink">
          No orders yet
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-ink/45">
          Order history will appear here once checkout is connected in a live
          store. Your cart and wishlist are already saved in this browser.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-[11px] font-semibold text-cream transition-colors hover:bg-olive"
        >
          Browse products
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function WishlistPanel() {
  const { wishlistProducts } = useStore();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-ink">
            My wishlist
          </h2>
          <p className="mt-1 text-[12px] text-ink/45">
            {wishlistProducts.length === 0
              ? "Saved pieces will appear here."
              : `${wishlistProducts.length} saved ${
                  wishlistProducts.length === 1 ? "piece" : "pieces"
                }.`}
          </p>
        </div>
        <Link
          href="/wishlist"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-ink/55 transition-colors hover:text-ink"
        >
          Open wishlist
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line bg-cream/60 px-6 py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-beige/70 text-ink/45">
            <Heart className="h-5 w-5" />
          </span>
          <h3 className="mt-3 font-heading text-base font-bold text-ink">
            Nothing saved yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-ink/45">
            Tap the heart on any product to keep it close.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-[11px] font-semibold text-cream transition-colors hover:bg-olive"
          >
            Explore the collection
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ onSignOut }: { onSignOut: () => void }) {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [journalUpdates, setJournalUpdates] = useState(false);

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-ink">
        Account settings
      </h2>
      <p className="mt-1 text-[12px] text-ink/45">
        Simple controls for your prototype account.
      </p>

      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-line/80 bg-cream/70 p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/35">
            Email preferences
          </p>
          <div className="mt-3 space-y-3">
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="block text-[12px] font-medium text-ink">
                  Order updates
                </span>
                <span className="mt-0.5 block text-[10px] text-ink/40">
                  Dispatch and delivery notes.
                </span>
              </span>
              <input
                type="checkbox"
                checked={orderUpdates}
                onChange={(event) => setOrderUpdates(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-olive"
              />
            </label>
            <div className="h-px bg-line/70" />
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="block text-[12px] font-medium text-ink">
                  Journal updates
                </span>
                <span className="mt-0.5 block text-[10px] text-ink/40">
                  Occasional product notes and edits.
                </span>
              </span>
              <input
                type="checkbox"
                checked={journalUpdates}
                onChange={(event) => setJournalUpdates(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-olive"
              />
            </label>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-ink/35">
            Preferences are visual only and are not saved in this prototype.
          </p>
        </div>

        <div className="rounded-xl border border-line/80 bg-cream/70 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-beige/70 text-ink/45">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12px] font-medium text-ink">
                Password and security
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-ink/45">
                Sign-in is protected with a one-time code sent to your email.
                Password reset by email is not available yet.
              </p>
              <Link
                href="/account/forgot-password"
                className="mt-2 inline-flex text-[10px] font-medium text-ink/60 underline-offset-4 hover:text-ink hover:underline"
              >
                Preview recovery flow
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line/80 bg-cream/70 p-4">
          <p className="text-[12px] font-medium text-ink">Session</p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink/45">
            Sign out to clear the local session on this browser. Your cart and
            wishlist stay untouched.
          </p>
          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-cream px-4 text-[11px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-beige/60"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function SignedInDashboard({ user }: { user: AccountUser }) {
  const { signOut } = useAuth();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    isTab(requestedTab) ? requestedTab : "profile"
  );

  useEffect(() => {
    setActiveTab(isTab(requestedTab) ? requestedTab : "profile");
  }, [requestedTab]);

  const firstName = user.name.split(/\s+/)[0] || "there";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-olive">
        RIAF account
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Hello, {firstName}.
          </h1>
          <p className="mt-1.5 text-[12px] text-ink/45">
            Your details, orders and saved pieces in one quiet place.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-cream px-4 text-[11px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-beige/60"
        >
          Continue shopping
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line bg-white/50 p-3">
            <div className="flex items-center gap-3 px-1 py-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-olive font-heading text-[11px] font-bold text-cream">
                {getInitials(user.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-heading text-[12px] font-bold text-ink">
                  {user.name}
                </span>
                <span className="block truncate text-[10px] text-ink/40">
                  {user.email}
                </span>
              </span>
            </div>

            <nav
              aria-label="Account sections"
              className="mt-2 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
            >
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[11px] font-medium transition-colors lg:w-full ${
                      active
                        ? "bg-ink text-cream"
                        : "text-ink/55 hover:bg-beige/60 hover:text-ink"
                    }`}
                  >
                    <span className={active ? "text-cream/70" : "text-ink/35"}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="my-2 hidden h-px bg-line lg:block" />

            <button
              type="button"
              onClick={signOut}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[11px] font-medium text-ink/50 transition-colors hover:bg-beige/60 hover:text-ink"
            >
              <LogOut className="h-4 w-4 text-ink/35" />
              Sign out
            </button>
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border border-line bg-white/50 p-5 sm:p-7">
          {activeTab === "profile" && <ProfilePanel user={user} />}
          {activeTab === "orders" && <OrdersPanel />}
          {activeTab === "wishlist" && <WishlistPanel />}
          {activeTab === "settings" && <SettingsPanel onSignOut={signOut} />}
        </section>
      </div>
    </div>
  );
}

export function AccountDashboard() {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/account/sign-in");
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return <AccountLoading />;
  }

  return <SignedInDashboard user={user} />;
}
