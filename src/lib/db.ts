import path from "path";
import fs from "fs";

function getDataDir(): string {
  const preferred = path.join(process.cwd(), ".data");
  try {
    if (!fs.existsSync(preferred)) fs.mkdirSync(preferred, { recursive: true });
    // Test write access
    const testFile = path.join(preferred, ".write-test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    return preferred;
  } catch {
    // Fall back to /tmp on read-only filesystems (Railway, etc.)
    const fallback = "/tmp/openly-data";
    if (!fs.existsSync(fallback)) fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

const DATA_DIR = getDataDir();

const DB_PATH = path.join(DATA_DIR, "openly.json");

interface Store {
  accounts: Record<string, Record<string, string>>;
  scheduledPosts: ScheduledPost[];
}

interface ScheduledPost {
  id: number;
  text: string;
  platform: string;
  scheduledAt: string;
  status: "pending" | "posted" | "failed";
  createdAt: string;
  postedAt?: string;
  error?: string;
}

function read(): Store {
  if (!fs.existsSync(DB_PATH)) {
    return { accounts: {}, scheduledPosts: [] };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function write(store: Store) {
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2));
}

export function getAccount(platform: string) {
  const store = read();
  return store.accounts[platform] || null;
}

export function saveAccount(platform: string, credentials: Record<string, string>) {
  const store = read();
  store.accounts[platform] = credentials;
  write(store);
}

export function deleteAccount(platform: string) {
  const store = read();
  delete store.accounts[platform];
  write(store);
}

export function getConnectedPlatforms(): string[] {
  const store = read();
  return Object.keys(store.accounts);
}

export function addScheduledPost(text: string, platform: string, scheduledAt: string) {
  const store = read();
  const id = store.scheduledPosts.length > 0
    ? Math.max(...store.scheduledPosts.map((p) => p.id)) + 1
    : 1;
  store.scheduledPosts.push({
    id,
    text,
    platform,
    scheduledAt,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  write(store);
  return id;
}

export function getPendingPosts(): ScheduledPost[] {
  const store = read();
  const now = new Date().toISOString();
  return store.scheduledPosts.filter(
    (p) => p.status === "pending" && p.scheduledAt <= now
  );
}

export function markPostComplete(id: number, error?: string) {
  const store = read();
  const post = store.scheduledPosts.find((p) => p.id === id);
  if (post) {
    if (error) {
      post.status = "failed";
      post.error = error;
    } else {
      post.status = "posted";
      post.postedAt = new Date().toISOString();
    }
    write(store);
  }
}
