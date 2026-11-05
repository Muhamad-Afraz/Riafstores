export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function isValidName(value: string) {
  return value.trim().length >= 2;
}

export function isValidPassword(value: string) {
  return value.length >= 8;
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "R";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const words = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map(
      (word) =>
        `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
    );

  return words.join(" ") || "RIAF Customer";
}
