const textEncoder = new TextEncoder();

const toBase64Url = (value: string) => {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const fromBytesToHex = (bytes: Uint8Array) => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const generateSalt = () => {
  return generateId().replace(/-/g, "").slice(0, 16);
};

export const hashValue = async (value: string) => {
  const data = textEncoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return fromBytesToHex(new Uint8Array(hashBuffer));
};

export const hashPassword = async (password: string, salt: string) => {
  return hashValue(`${salt}:${password}`);
};

export const generateFakeJwt = (payload: Record<string, unknown>) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = toBase64Url(`mock-signature-${Date.now()}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isStrongPassword = (password: string) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
    password,
  );
};
