"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AccountUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type AuthField = "name" | "email" | "password" | "code";

export type AuthResult =
  | { ok: true; user?: AccountUser }
  | { ok: false; message: string; field?: AuthField };

export type SignInResult =
  | { ok: true; user: AccountUser }
  | {
      ok: true;
      otpRequired: true;
      email: string;
      challengeId: string;
      expiresAt: string;
      emailSent: boolean;
      devCode?: string;
    }
  | { ok: false; message: string; field?: AuthField };

export type OtpResendResult =
  | {
      ok: true;
      email: string;
      challengeId: string;
      expiresAt: string;
      emailSent: boolean;
      devCode?: string;
    }
  | { ok: false; message: string };

export type PasswordResetStartResult =
  | {
      ok: true;
      email: string;
      challengeId: string;
      expiresAt: string;
      emailSent: boolean;
      devCode?: string;
    }
  | { ok: false; message: string; field?: AuthField };

export type AuthProviders = {
  google: boolean;
  email: boolean;
};

type AuthContextValue = {
  user: AccountUser | null;
  hydrated: boolean;
  providers: AuthProviders | null;
  signIn: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<SignInResult>;
  verifyOtp: (
    challengeId: string,
    email: string,
    code: string,
    remember: boolean,
  ) => Promise<AuthResult>;
  resendOtp: (
    challengeId: string,
    email: string,
  ) => Promise<OtpResendResult>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  updateProfile: (name: string, email: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<PasswordResetStartResult>;
  resendPasswordReset: (
    challengeId: string,
    email: string,
  ) => Promise<PasswordResetStartResult>;
  verifyPasswordReset: (
    challengeId: string,
    email: string,
    code: string,
  ) => Promise<AuthResult>;
  resetPassword: (password: string) => Promise<AuthResult>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LEGACY_KEYS = [
  "riaf-user",
  "riaf-session",
  "riaf-accounts",
  "riaf-auth-accounts-v1",
  "riaf-auth-session-v1",
];

const NETWORK_ERROR =
  "We could not reach the RIAF service. Check your connection and try again.";

function isAccountUser(value: unknown): value is AccountUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Partial<AccountUser>;
  return (
    typeof user.id === "string" &&
    user.id.length > 0 &&
    typeof user.name === "string" &&
    user.name.trim().length > 0 &&
    typeof user.email === "string" &&
    user.email.includes("@")
  );
}

function clearLegacyStorage() {
  for (const key of LEGACY_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage may be unavailable.
    }

    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Storage may be unavailable.
    }
  }
}

async function requestJson(
  url: string,
  init?: RequestInit,
): Promise<{ response: Response; data: Record<string, unknown> } | null> {
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    const data = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    return { response, data };
  } catch {
    return null;
  }
}

function errorMessage(
  data: Record<string, unknown>,
  fallback = "Something went wrong. Please try again.",
) {
  return typeof data.error === "string" && data.error ? data.error : fallback;
}

function errorField(data: Record<string, unknown>): AuthField | undefined {
  const field = data.field;
  return field === "name" ||
    field === "email" ||
    field === "password" ||
    field === "code"
    ? field
    : undefined;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [providers, setProviders] = useState<AuthProviders | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const result = await requestJson("/api/account/session");

      if (!active) return;

      if (!result) {
        setHydrated(true);
        return;
      }

      const nextUser = result.data.user;
      setUser(isAccountUser(nextUser) ? nextUser : null);

      const rawProviders = result.data.providers;
      if (typeof rawProviders === "object" && rawProviders !== null) {
        const value = rawProviders as { google?: unknown; email?: unknown };
        setProviders({
          google: value.google === true,
          email: value.email === true,
        });
      }

      setHydrated(true);
    };

    clearLegacyStorage();
    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(
    async (
      email: string,
      password: string,
      remember: boolean,
    ): Promise<SignInResult> => {
      const result = await requestJson("/api/account/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember }),
      });

      if (!result) {
        return { ok: false, message: NETWORK_ERROR };
      }

      const { response, data } = result;

      if (!response.ok) {
        return {
          ok: false,
          message: errorMessage(data),
          field: errorField(data),
        };
      }

      if (data.otpRequired === true) {
        return {
          ok: true,
          otpRequired: true,
          email: typeof data.email === "string" ? data.email : email,
          challengeId:
            typeof data.challengeId === "string" ? data.challengeId : "",
          expiresAt:
            typeof data.expiresAt === "string" ? data.expiresAt : "",
          emailSent: data.emailSent === true,
          devCode: typeof data.devCode === "string" ? data.devCode : undefined,
        };
      }

      if (isAccountUser(data.user)) {
        setUser(data.user);
        return { ok: true, user: data.user };
      }

      return { ok: false, message: "Sign-in could not be completed." };
    },
    [],
  );

  const verifyOtp = useCallback(
    async (
      challengeId: string,
      email: string,
      code: string,
      remember: boolean,
    ): Promise<AuthResult> => {
      const result = await requestJson("/api/account/otp/verify", {
        method: "POST",
        body: JSON.stringify({ challengeId, email, code, remember }),
      });

      if (!result) {
        return { ok: false, message: NETWORK_ERROR };
      }

      const { response, data } = result;

      if (!response.ok) {
        return {
          ok: false,
          message: errorMessage(data),
          field: errorField(data),
        };
      }

      if (!isAccountUser(data.user)) {
        return { ok: false, message: "Sign-in could not be completed." };
      }

      setUser(data.user);
      return { ok: true, user: data.user };
    },
    [],
  );

  const resendOtp = useCallback(
    async (
      challengeId: string,
      email: string,
    ): Promise<OtpResendResult> => {
      const result = await requestJson("/api/account/otp/resend", {
        method: "POST",
        body: JSON.stringify({ challengeId, email }),
      });

      if (!result) {
        return { ok: false, message: NETWORK_ERROR };
      }

      const { response, data } = result;

      if (!response.ok) {
        return { ok: false, message: errorMessage(data) };
      }

      return {
        ok: true,
        email: typeof data.email === "string" ? data.email : email,
        challengeId:
          typeof data.challengeId === "string" ? data.challengeId : "",
        expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : "",
        emailSent: data.emailSent === true,
        devCode: typeof data.devCode === "string" ? data.devCode : undefined,
      };
    },
    [],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ): Promise<AuthResult> => {
      const result = await requestJson("/api/account/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      if (!result) {
        return { ok: false, message: NETWORK_ERROR };
      }

      const { response, data } = result;

      if (!response.ok) {
        return {
          ok: false,
          message: errorMessage(data),
          field: errorField(data),
        };
      }

      if (!isAccountUser(data.user)) {
        return { ok: false, message: "Your account could not be created." };
      }

      setUser(data.user);
      return { ok: true, user: data.user };
    },
    [],
  );

  const updateProfile = useCallback(
    async (name: string, email: string): Promise<AuthResult> => {
      const result = await requestJson("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
      });

      if (!result) {
        return { ok: false, message: NETWORK_ERROR };
      }

      const { response, data } = result;

      if (!response.ok) {
        return {
          ok: false,
          message: errorMessage(data),
          field: errorField(data),
        };
      }

      if (!isAccountUser(data.user)) {
        return { ok: false, message: "Your profile could not be updated." };
      }

      setUser(data.user);
      return { ok: true, user: data.user };
    },
    [],
  );

  const forgotPassword = useCallback(
    async (email: string): Promise<PasswordResetStartResult> => {
      const result = await requestJson("/api/account/password/forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (!result) {
        return { ok: false, message: NETWORK_ERROR };
      }

      const { response, data } = result;

      if (!response.ok) {
        return {
          ok: false,
          message: errorMessage(data),
          field: errorField(data),
        };
      }

      return {
        ok: true,
        email: typeof data.email === "string" ? data.email : email,
        challengeId:
          typeof data.challengeId === "string" ? data.challengeId : "",
        expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : "",
        emailSent: data.emailSent === true,
        devCode: typeof data.devCode === "string" ? data.devCode : undefined,
      };
    },
    [],
  );

  const resendPasswordReset = useCallback(
    async (
      challengeId: string,
      email: string,
    ): Promise<PasswordResetStartResult> => {
      const result = await requestJson("/api/account/password/resend", {
        method: "POST",
        body: JSON.stringify({ challengeId, email }),
      });

      if (!result) {
        return { ok: false, message: NETWORK_ERROR };
      }

      const { response, data } = result;

      if (!response.ok) {
        return {
          ok: false,
          message: errorMessage(data),
          field: errorField(data),
        };
      }

      return {
        ok: true,
        email: typeof data.email === "string" ? data.email : email,
        challengeId:
          typeof data.challengeId === "string" ? data.challengeId : "",
        expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : "",
        emailSent: data.emailSent === true,
        devCode: typeof data.devCode === "string" ? data.devCode : undefined,
      };
    },
    [],
  );

  const verifyPasswordReset = useCallback(
    async (
      challengeId: string,
      email: string,
      code: string,
    ): Promise<AuthResult> => {
      const result = await requestJson("/api/account/password/verify", {
        method: "POST",
        body: JSON.stringify({ challengeId, email, code }),
      });

      if (!result) {
        return { ok: false, message: NETWORK_ERROR };
      }

      const { response, data } = result;

      if (!response.ok) {
        return {
          ok: false,
          message: errorMessage(data),
          field: errorField(data),
        };
      }

      return { ok: true };
    },
    [],
  );

  const resetPassword = useCallback(
    async (password: string): Promise<AuthResult> => {
      const result = await requestJson("/api/account/password/reset", {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      if (!result) {
        return { ok: false, message: NETWORK_ERROR };
      }

      const { response, data } = result;

      if (!response.ok) {
        return {
          ok: false,
          message: errorMessage(data),
          field: errorField(data),
        };
      }

      setUser(null);
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(() => {
    setUser(null);
    void fetch("/api/account/logout", {
      method: "POST",
      cache: "no-store",
    }).catch(() => undefined);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      providers,
      signIn,
      verifyOtp,
      resendOtp,
      register,
      updateProfile,
      forgotPassword,
      resendPasswordReset,
      verifyPasswordReset,
      resetPassword,
      signOut,
    }),
    [
      user,
      hydrated,
      providers,
      signIn,
      verifyOtp,
      resendOtp,
      register,
      updateProfile,
      forgotPassword,
      resendPasswordReset,
      verifyPasswordReset,
      resetPassword,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
