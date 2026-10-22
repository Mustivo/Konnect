import fs from "fs";
import path from "path";

export interface PersistentTeacherProfile {
  id?: number | string;
  email: string;
  username?: string;
  full_legal_name: string;
  display_name: string;
  phone_number?: string;
  country?: string;
  legal_name_on_documents?: string;
  headline?: string;
  years_of_experience?: string;
  bio?: string;
  education_level_taught?: string;
  current_institution?: string;
  teaching_mode?: string;
  subjects_expertise?: string | string[];
  languages?: string | string[];
  portfolio_url?: string;
  cv_url?: string;
  degree_certificate_url?: string;
  profile_picture_url?: string;
  verification_status?: "PENDING" | "VERIFIED" | "REJECTED";
  created_at?: string;
  updated_at?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "teachers.json");

function ensureStoreDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create data directory:", error);
  }
}

function readStore(): Record<string, PersistentTeacherProfile> {
  ensureStoreDir();
  try {
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, "utf-8"));
    }
  } catch (error) {
    console.error("Failed to read teachers store file:", error);
  }
  return {};
}

function writeStore(data: Record<string, PersistentTeacherProfile>): void {
  ensureStoreDir();
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write teachers store file:", error);
  }
}

export function saveTeacherProfile(
  email: string,
  profile: Partial<PersistentTeacherProfile>,
): PersistentTeacherProfile {
  const cleanEmail = email.trim().toLowerCase();
  const store = readStore();
  const existing = store[cleanEmail] || {
    email: cleanEmail,
    full_legal_name: "",
    display_name: "",
    verification_status: "VERIFIED" as const,
    created_at: new Date().toISOString(),
  };

  const updated: PersistentTeacherProfile = {
    ...existing,
    ...profile,
    email: cleanEmail,
    updated_at: new Date().toISOString(),
  };
  store[cleanEmail] = updated;
  writeStore(store);
  return updated;
}

export function getTeacherProfileByEmail(email: string): PersistentTeacherProfile | null {
  if (!email) return null;
  return readStore()[email.trim().toLowerCase()] || null;
}

export function isRegisteredTeacher(email: string): boolean {
  if (!email) return false;
  return Boolean(readStore()[email.trim().toLowerCase()]);
}

export function getAllTeacherProfiles(): PersistentTeacherProfile[] {
  return Object.values(readStore());
}
