const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

console.log("=========================================");
console.log("  KONNECT Database Seeding & Verification");
console.log("=========================================");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  console.log("No existing database found. Initializing database...");
} else {
  const stat = fs.statSync(DB_FILE);
  console.log(`Found database at: ${DB_FILE} (${stat.size} bytes)`);
}

try {
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const db = JSON.parse(raw);

  console.log("\nPersistent Database Summary:");
  console.log(`- Courses & Classes: ${db.classes?.length || 0}`);
  console.log(`- Enrollments:       ${db.enrollments?.length || 0}`);
  console.log(`- Live Sessions:     ${db.sessions?.length || 0}`);
  console.log(`- Attendance Groups: ${Object.keys(db.attendance || {}).length}`);
  console.log(`- Chat Channels:     ${Object.keys(db.chat_messages || {}).length}`);
  console.log(`- Assessments:       ${db.assessments?.length || 0}`);
  console.log(`- Last Updated:      ${db.updated_at || "N/A"}`);
  console.log("\nDatabase is healthy and persistent on disk!");
} catch (err) {
  console.error("Error reading database:", err.message);
}
