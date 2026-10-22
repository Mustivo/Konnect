import fs from "fs";
import path from "path";

export interface StoredCredential {
  email: string;
  password: string;
  backend_password?: string;
  updated_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CREDS_FILE = path.join(DATA_DIR, "auth_credentials.json");

function readCredentials(): Record<string, StoredCredential> {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(CREDS_FILE)) {
      return JSON.parse(fs.readFileSync(CREDS_FILE, "utf-8"));
    }
  } catch (error) {
    console.error("Failed to read credentials store:", error);
  }
  return {};
}

function writeCredentials(data: Record<string, StoredCredential>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CREDS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write credentials store:", error);
  }
}

export function setUserPassword(
  email: string,
  password: string,
  backendPassword?: string,
): StoredCredential {
  const cleanEmail = email.trim().toLowerCase();
  const store = readCredentials();
  const existing = store[cleanEmail];
  const updated: StoredCredential = {
    email: cleanEmail,
    password: password.trim(),
    backend_password: backendPassword || existing?.backend_password || "ValidPassword123!",
    updated_at: new Date().toISOString(),
  };
  store[cleanEmail] = updated;
  writeCredentials(store);
  return updated;
}

export function getUserAuth(email: string): StoredCredential | null {
  if (!email) return null;
  return readCredentials()[email.trim().toLowerCase()] || null;
}

export function verifyUserPassword(email: string, candidate: string): boolean {
  const auth = getUserAuth(email);
  return Boolean(auth && auth.password === candidate);
}
