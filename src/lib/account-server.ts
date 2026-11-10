import {
  createHash,
  pbkdf2,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
  normalizeEmail,
} from "./account";
import { dbQuery, isDatabaseConfigured } from "./db";

const deriveKey = promisify(pbkdf2);
const PASSWORD_ITERATIONS = 210_000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = "sha256";
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const dataDir = path.join(process.cwd(), "data");
const accountsPath = path.join(dataDir, "accounts.json");
const challengesPath = path.join(dataDir, "login-challenges.json");

export type StoreAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  passwordSalt: string | null;
  passwordIterations: number | null;
  googleId: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicAccount = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type ChallengePurpose = "login" | "password-reset" | "admin-login";

export type LoginChallenge = {
  id: string;
  email: string;
  codeHash: string;
  attempts: number;
  purpose: ChallengePurpose;
  expiresAt: string;
  createdAt: string;
};

type PasswordDigest = {
  passwordHash: string;
  passwordSalt: string;
  passwordIterations: number;
};

type AccountRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  password_salt: string | null;
  password_iterations: number | null;
  google_id: string | null;
  avatar_url: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type ChallengeRow = {
  id: string;
  email: string;
  code_hash: string;
  attempts: number;
  purpose: string | null;
  expires_at: Date | string;
  created_at: Date | string;
};

type AccountsFile = { accounts: StoreAccount[] };
type ChallengesFile = { challenges: LoginChallenge[] };

export class AccountExistsError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "AccountExistsError";
  }
}

export function toPublicAccount(account: StoreAccount): PublicAccount {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    avatarUrl: account.avatarUrl,
  };
}

export function publicAccountFromRow(row: AccountRow): PublicAccount {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url,
  };
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapAccountRow(row: AccountRow): StoreAccount {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    passwordIterations: row.password_iterations,
    googleId: row.google_id,
    avatarUrl: row.avatar_url,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function normalizePurpose(value: unknown): ChallengePurpose {
  if (value === "password-reset") return "password-reset";
  if (value === "admin-login") return "admin-login";
  return "login";
}

function mapChallengeRow(row: ChallengeRow): LoginChallenge {
  return {
    id: row.id,
    email: row.email,
    codeHash: row.code_hash,
    attempts: row.attempts,
    purpose: normalizePurpose(row.purpose),
    expiresAt: toIsoString(row.expires_at),
    createdAt: toIsoString(row.created_at),
  };
}

function isStoreAccount(value: unknown): value is StoreAccount {
  if (typeof value !== "object" || value === null) return false;
  const account = value as Partial<StoreAccount>;
  return (
    typeof account.id === "string" &&
    account.id.length > 0 &&
    typeof account.name === "string" &&
    account.name.trim().length > 0 &&
    typeof account.email === "string" &&
    isValidEmail(account.email) &&
    (account.passwordHash === null ||
      typeof account.passwordHash === "string") &&
    (account.passwordSalt === null ||
      typeof account.passwordSalt === "string") &&
    (account.passwordIterations === null ||
      typeof account.passwordIterations === "number") &&
    (account.googleId === null || typeof account.googleId === "string") &&
    (account.avatarUrl === null || typeof account.avatarUrl === "string") &&
    typeof account.createdAt === "string" &&
    typeof account.updatedAt === "string"
  );
}

function isLoginChallenge(value: unknown): value is LoginChallenge {
  if (typeof value !== "object" || value === null) return false;
  const challenge = value as Partial<LoginChallenge>;
  return (
    typeof challenge.id === "string" &&
    challenge.id.length > 0 &&
    typeof challenge.email === "string" &&
    isValidEmail(challenge.email) &&
    typeof challenge.codeHash === "string" &&
    challenge.codeHash.length > 0 &&
    typeof challenge.attempts === "number" &&
    Number.isInteger(challenge.attempts) &&
    challenge.attempts >= 0 &&
    (challenge.purpose === undefined ||
      challenge.purpose === "login" ||
      challenge.purpose === "password-reset" ||
      challenge.purpose === "admin-login") &&
    typeof challenge.expiresAt === "string" &&
    typeof challenge.createdAt === "string"
  );
}

let storeLock: Promise<unknown> = Promise.resolve();

function withStoreLock<T>(task: () => Promise<T>): Promise<T> {
  const run = storeLock.then(task, task);
  storeLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  let raw: string;

  try {
    raw = await fs.readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }

  const content = raw.replace(/^\uFEFF/, "").trim();
  if (!content) return fallback;

  // A parse failure must surface instead of being treated as an empty store,
  // otherwise the next write would silently erase every stored record.
  return JSON.parse(content) as T;
}

async function writeJsonFile(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  const temp = `${file}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;

  await fs.writeFile(temp, payload, "utf8");

  try {
    await fs.rename(temp, file);
  } catch {
    await fs.writeFile(file, payload, "utf8");
    await fs.rm(temp, { force: true });
  }
}

async function readAccountsFile(): Promise<StoreAccount[]> {
  const parsed = await readJsonFile<Partial<AccountsFile>>(accountsPath, {});
  if (!Array.isArray(parsed.accounts)) return [];

  return parsed.accounts.filter(isStoreAccount).map((account) => ({
    ...account,
    name: account.name.trim(),
    email: normalizeEmail(account.email),
  }));
}

async function writeAccountsFile(accounts: StoreAccount[]) {
  await writeJsonFile(accountsPath, { accounts });
}

async function readChallengesFile(): Promise<LoginChallenge[]> {
  const parsed = await readJsonFile<Partial<ChallengesFile>>(
    challengesPath,
    {},
  );
  if (!Array.isArray(parsed.challenges)) return [];

  return parsed.challenges.filter(isLoginChallenge).map((challenge) => ({
    ...challenge,
    email: normalizeEmail(challenge.email),
    purpose: normalizePurpose(challenge.purpose),
  }));
}

async function writeChallengesFile(challenges: LoginChallenge[]) {
  await writeJsonFile(challengesPath, { challenges });
}

export async function deleteChallengesForEmail(
  email: string,
  purpose: ChallengePurpose,
) {
  const normalized = normalizeEmail(email);

  if (isDatabaseConfigured()) {
    await dbQuery(
      "DELETE FROM store_login_challenges WHERE email = $1 AND purpose = $2",
      [normalized, purpose],
    );
    return;
  }

  await withStoreLock(async () => {
    const challenges = await readChallengesFile();
    await writeChallengesFile(
      challenges.filter(
        (challenge) =>
          !(challenge.email === normalized && challenge.purpose === purpose),
      ),
    );
  });
}

function otpPepper() {
  return (
    process.env.AUTH_OTP_SECRET?.trim() ||
    process.env.AUTH_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    "riaf-development-otp-secret"
  );
}

function hashCode(id: string, email: string, code: string) {
  return createHash("sha256")
    .update(`${id}:${normalizeEmail(email)}:${code}:${otpPepper()}`)
    .digest("hex");
}

function safeEqualHex(left: string, right: string) {
  if (left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

export async function createPasswordDigest(
  password: string,
): Promise<PasswordDigest> {
  const salt = randomBytes(16);
  const derived = (await deriveKey(
    password,
    salt,
    PASSWORD_ITERATIONS,
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST,
  )) as Buffer;

  return {
    passwordHash: derived.toString("base64"),
    passwordSalt: salt.toString("base64"),
    passwordIterations: PASSWORD_ITERATIONS,
  };
}

export async function verifyAccountPassword(
  account: StoreAccount,
  password: string,
) {
  if (
    !account.passwordHash ||
    !account.passwordSalt ||
    !account.passwordIterations
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(account.passwordSalt, "base64");
    const stored = Buffer.from(account.passwordHash, "base64");
    const candidate = (await deriveKey(
      password,
      salt,
      account.passwordIterations,
      stored.length,
      PASSWORD_DIGEST,
    )) as Buffer;

    return (
      candidate.length === stored.length &&
      timingSafeEqual(candidate, stored)
    );
  } catch {
    return false;
  }
}

export async function findAccountByEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return null;

  if (isDatabaseConfigured()) {
    const rows = await dbQuery<AccountRow>(
      "SELECT * FROM store_accounts WHERE email = $1 LIMIT 1",
      [normalized],
    );
    return rows[0] ? mapAccountRow(rows[0]) : null;
  }

  const accounts = await readAccountsFile();
  return accounts.find((account) => account.email === normalized) ?? null;
}

export async function findAccountById(id: string) {
  if (!id) return null;

  if (isDatabaseConfigured()) {
    const rows = await dbQuery<AccountRow>(
      "SELECT * FROM store_accounts WHERE id = $1 LIMIT 1",
      [id],
    );
    return rows[0] ? mapAccountRow(rows[0]) : null;
  }

  const accounts = await readAccountsFile();
  return accounts.find((account) => account.id === id) ?? null;
}

export async function findAccountByGoogleId(googleId: string) {
  if (!googleId) return null;

  if (isDatabaseConfigured()) {
    const rows = await dbQuery<AccountRow>(
      "SELECT * FROM store_accounts WHERE google_id = $1 LIMIT 1",
      [googleId],
    );
    return rows[0] ? mapAccountRow(rows[0]) : null;
  }

  const accounts = await readAccountsFile();
  return accounts.find((account) => account.googleId === googleId) ?? null;
}

type CreateAccountInput = {
  name: string;
  email: string;
  password?: string;
  googleId?: string | null;
  avatarUrl?: string | null;
};

export async function createAccount(input: CreateAccountInput) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (!isValidName(name)) throw new Error("Enter your full name.");
  if (!isValidEmail(email)) throw new Error("Enter a valid email address.");
  if (input.password !== undefined && !isValidPassword(input.password)) {
    throw new Error("Use at least 8 characters for your password.");
  }

  const digest = input.password
    ? await createPasswordDigest(input.password)
    : null;
  const now = new Date().toISOString();

  const account: StoreAccount = {
    id: randomUUID(),
    name,
    email,
    passwordHash: digest?.passwordHash ?? null,
    passwordSalt: digest?.passwordSalt ?? null,
    passwordIterations: digest?.passwordIterations ?? null,
    googleId: input.googleId ?? null,
    avatarUrl: input.avatarUrl ?? null,
    createdAt: now,
    updatedAt: now,
  };

  if (isDatabaseConfigured()) {
    try {
      await dbQuery(
        `INSERT INTO store_accounts
           (id, name, email, password_hash, password_salt, password_iterations,
            google_id, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          account.id,
          account.name,
          account.email,
          account.passwordHash,
          account.passwordSalt,
          account.passwordIterations,
          account.googleId,
          account.avatarUrl,
        ],
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new AccountExistsError();
      }
      throw error;
    }

    return account;
  }

  return withStoreLock(async () => {
    const accounts = await readAccountsFile();
    if (accounts.some((entry) => entry.email === email)) {
      throw new AccountExistsError();
    }
    if (
      account.googleId &&
      accounts.some((entry) => entry.googleId === account.googleId)
    ) {
      throw new AccountExistsError();
    }

    await writeAccountsFile([...accounts, account]);
    return account;
  });
}

type UpdateAccountInput = {
  name: string;
  email: string;
  googleId?: string | null;
  avatarUrl?: string | null;
};

export async function updateAccount(id: string, input: UpdateAccountInput) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (!isValidName(name)) throw new Error("Enter your full name.");
  if (!isValidEmail(email)) throw new Error("Enter a valid email address.");

  const existing = await findAccountById(id);
  if (!existing) return null;

  const updated: StoreAccount = {
    ...existing,
    name,
    email,
    googleId:
      input.googleId === undefined ? existing.googleId : input.googleId,
    avatarUrl:
      input.avatarUrl === undefined ? existing.avatarUrl : input.avatarUrl,
    updatedAt: new Date().toISOString(),
  };

  if (isDatabaseConfigured()) {
    try {
      await dbQuery(
        `UPDATE store_accounts
            SET name = $2,
                email = $3,
                google_id = $4,
                avatar_url = $5,
                updated_at = NOW()
          WHERE id = $1`,
        [id, updated.name, updated.email, updated.googleId, updated.avatarUrl],
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new AccountExistsError();
      }
      throw error;
    }

    return updated;
  }

  return withStoreLock(async () => {
    const accounts = await readAccountsFile();
    const index = accounts.findIndex((account) => account.id === id);
    if (index === -1) return null;

    if (
      accounts.some(
        (account) => account.id !== id && account.email === updated.email,
      )
    ) {
      throw new AccountExistsError();
    }

    const next = [...accounts];
    next[index] = updated;
    await writeAccountsFile(next);
    return updated;
  });
}

export async function updateAccountPassword(
  accountId: string,
  password: string,
) {
  if (!isValidPassword(password)) {
    throw new Error("Use at least 8 characters for your password.");
  }

  const digest = await createPasswordDigest(password);

  if (isDatabaseConfigured()) {
    const rows = await dbQuery<AccountRow>(
      `UPDATE store_accounts
          SET password_hash = $2,
              password_salt = $3,
              password_iterations = $4,
              updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
      [
        accountId,
        digest.passwordHash,
        digest.passwordSalt,
        digest.passwordIterations,
      ],
    );
    return rows[0] ? mapAccountRow(rows[0]) : null;
  }

  return withStoreLock(async () => {
    const accounts = await readAccountsFile();
    const index = accounts.findIndex((account) => account.id === accountId);
    if (index === -1) return null;

    const updated: StoreAccount = {
      ...accounts[index],
      ...digest,
      updatedAt: new Date().toISOString(),
    };

    const next = [...accounts];
    next[index] = updated;
    await writeAccountsFile(next);
    return updated;
  });
}

export type CreatedLoginChallenge = {
  challengeId: string;
  code: string;
  expiresAt: string;
};

export async function createLoginChallenge(
  email: string,
  purpose: ChallengePurpose = "login",
): Promise<CreatedLoginChallenge> {
  const normalized = normalizeEmail(email);
  const id = randomBytes(24).toString("base64url");
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS).toISOString();

  const challenge: LoginChallenge = {
    id,
    email: normalized,
    codeHash: hashCode(id, normalized, code),
    attempts: 0,
    purpose,
    expiresAt,
    createdAt: now.toISOString(),
  };

  if (isDatabaseConfigured()) {
    await dbQuery(
      `INSERT INTO store_login_challenges
         (id, email, code_hash, attempts, purpose, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        challenge.id,
        challenge.email,
        challenge.codeHash,
        challenge.attempts,
        challenge.purpose,
        challenge.expiresAt,
      ],
    );

    dbQuery(
      "DELETE FROM store_login_challenges WHERE expires_at < NOW()",
    ).catch(() => undefined);
  } else {
    await withStoreLock(async () => {
      const nowIso = new Date().toISOString();
      const challenges = (await readChallengesFile()).filter(
        (entry) => entry.expiresAt > nowIso,
      );
      await writeChallengesFile([...challenges, challenge]);
    });
  }

  return { challengeId: challenge.id, code, expiresAt };
}

export async function getLoginChallenge(id: string) {
  if (!id) return null;

  if (isDatabaseConfigured()) {
    const rows = await dbQuery<ChallengeRow>(
      "SELECT * FROM store_login_challenges WHERE id = $1 LIMIT 1",
      [id],
    );
    return rows[0] ? mapChallengeRow(rows[0]) : null;
  }

  const challenges = await readChallengesFile();
  return challenges.find((challenge) => challenge.id === id) ?? null;
}

async function deleteLoginChallenge(id: string) {
  if (isDatabaseConfigured()) {
    await dbQuery("DELETE FROM store_login_challenges WHERE id = $1", [id]);
    return;
  }

  await withStoreLock(async () => {
    const challenges = await readChallengesFile();
    await writeChallengesFile(
      challenges.filter((challenge) => challenge.id !== id),
    );
  });
}

async function incrementChallengeAttempts(id: string) {
  if (isDatabaseConfigured()) {
    await dbQuery(
      "UPDATE store_login_challenges SET attempts = attempts + 1 WHERE id = $1",
      [id],
    );
    return;
  }

  await withStoreLock(async () => {
    const challenges = await readChallengesFile();
    await writeChallengesFile(
      challenges.map((challenge) =>
        challenge.id === id
          ? { ...challenge, attempts: challenge.attempts + 1 }
          : challenge,
      ),
    );
  });
}

export type ChallengeVerification =
  | { ok: true }
  | { ok: false; message: string };

export async function verifyLoginChallenge(
  id: string,
  email: string,
  code: string,
  purpose: ChallengePurpose = "login",
): Promise<ChallengeVerification> {
  const challenge = await getLoginChallenge(id);

  if (!challenge) {
    return {
      ok: false,
      message: "That sign-in code is not valid. Request a new code and try again.",
    };
  }

  if (challenge.expiresAt <= new Date().toISOString()) {
    await deleteLoginChallenge(challenge.id);
    return {
      ok: false,
      message: "That sign-in code has expired. Request a new code and try again.",
    };
  }

  if (challenge.email !== normalizeEmail(email)) {
    return {
      ok: false,
      message: "That sign-in code is not valid. Request a new code and try again.",
    };
  }

  if (challenge.purpose !== purpose) {
    return {
      ok: false,
      message: "That sign-in code is not valid. Request a new code and try again.",
    };
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    await deleteLoginChallenge(challenge.id);
    return {
      ok: false,
      message: "Too many incorrect codes. Request a new code and try again.",
    };
  }

  const candidateHash = hashCode(challenge.id, challenge.email, code.trim());

  if (!safeEqualHex(candidateHash, challenge.codeHash)) {
    await incrementChallengeAttempts(challenge.id);
    const remaining = OTP_MAX_ATTEMPTS - challenge.attempts - 1;

    if (remaining <= 0) {
      await deleteLoginChallenge(challenge.id);
      return {
        ok: false,
        message: "Too many incorrect codes. Request a new code and try again.",
      };
    }

    return {
      ok: false,
      message: `That code is incorrect. ${remaining} ${
        remaining === 1 ? "attempt" : "attempts"
      } remaining.`,
    };
  }

  await deleteLoginChallenge(challenge.id);
  return { ok: true };
}

export async function replaceLoginChallenge(
  id: string,
  purpose: ChallengePurpose = "login",
) {
  const challenge = await getLoginChallenge(id);
  if (!challenge || challenge.purpose !== purpose) return null;

  await deleteLoginChallenge(challenge.id);
  return createLoginChallenge(challenge.email, purpose);
}
