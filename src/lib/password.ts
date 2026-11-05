const PASSWORD_ITERATIONS = 150_000;

export type PasswordDigest = {
  salt: string;
  passwordHash: string;
  iterations: number;
};

function getCrypto() {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Secure browser cryptography is unavailable.");
  }
  return window.crypto;
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(index, index + chunkSize)
    );
  }

  return window.btoa(binary);
}

function fromBase64(value: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}

async function derivePasswordHash(
  password: string,
  salt: Uint8Array,
  iterations: number
) {
  const cryptoApi = getCrypto();
  const keyMaterial = await cryptoApi.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const saltBuffer = salt.buffer.slice(
    salt.byteOffset,
    salt.byteOffset + salt.byteLength
  ) as ArrayBuffer;

  const bits = await cryptoApi.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return toBase64(new Uint8Array(bits));
}

export async function hashPassword(
  password: string
): Promise<PasswordDigest> {
  const cryptoApi = getCrypto();
  const salt = cryptoApi.getRandomValues(new Uint8Array(16));
  const passwordHash = await derivePasswordHash(
    password,
    salt,
    PASSWORD_ITERATIONS
  );

  return {
    salt: toBase64(salt),
    passwordHash,
    iterations: PASSWORD_ITERATIONS,
  };
}

export async function verifyPassword(
  password: string,
  digest: PasswordDigest
) {
  const salt = fromBase64(digest.salt);
  const candidate = await derivePasswordHash(
    password,
    salt,
    digest.iterations
  );

  return constantTimeEqual(candidate, digest.passwordHash);
}
