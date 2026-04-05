import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), ".data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "openly.db"));

db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    platform TEXT PRIMARY KEY,
    credentials TEXT NOT NULL,
    connected_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scheduled_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    platform TEXT NOT NULL,
    scheduled_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    posted_at TEXT,
    error TEXT
  );
`);

export default db;

export function getAccount(platform: string) {
  const row = db
    .prepare("SELECT credentials FROM accounts WHERE platform = ?")
    .get(platform) as { credentials: string } | undefined;
  return row ? JSON.parse(row.credentials) : null;
}

export function saveAccount(platform: string, credentials: Record<string, string>) {
  db.prepare(
    "INSERT OR REPLACE INTO accounts (platform, credentials, connected_at) VALUES (?, ?, datetime('now'))"
  ).run(platform, JSON.stringify(credentials));
}

export function deleteAccount(platform: string) {
  db.prepare("DELETE FROM accounts WHERE platform = ?").run(platform);
}

export function getConnectedPlatforms(): string[] {
  const rows = db.prepare("SELECT platform FROM accounts").all() as { platform: string }[];
  return rows.map((r) => r.platform);
}

export function addScheduledPost(text: string, platform: string, scheduledAt: string) {
  return db
    .prepare(
      "INSERT INTO scheduled_posts (text, platform, scheduled_at) VALUES (?, ?, ?)"
    )
    .run(text, platform, scheduledAt);
}

export function getPendingPosts() {
  return db
    .prepare(
      "SELECT * FROM scheduled_posts WHERE status = 'pending' AND scheduled_at <= datetime('now')"
    )
    .all();
}

export function markPostComplete(id: number, error?: string) {
  if (error) {
    db.prepare(
      "UPDATE scheduled_posts SET status = 'failed', error = ? WHERE id = ?"
    ).run(error, id);
  } else {
    db.prepare(
      "UPDATE scheduled_posts SET status = 'posted', posted_at = datetime('now') WHERE id = ?"
    ).run(id);
  }
}
