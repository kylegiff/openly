import { cookies } from "next/headers";

const COOKIE_PREFIX = "openly_";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
  sameSite: "lax" as const,
};

// --- Account storage via encrypted cookies ---

export async function getAccount(platform: string): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(`${COOKIE_PREFIX}${platform}`)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString());
  } catch {
    return null;
  }
}

export async function saveAccount(platform: string, credentials: Record<string, string>) {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(credentials)).toString("base64");
  cookieStore.set(`${COOKIE_PREFIX}${platform}`, encoded, COOKIE_OPTIONS);
}

export async function deleteAccount(platform: string) {
  const cookieStore = await cookies();
  cookieStore.delete(`${COOKIE_PREFIX}${platform}`);
}

export async function getConnectedPlatforms(): Promise<string[]> {
  const cookieStore = await cookies();
  const platforms: string[] = [];
  for (const name of ["x", "linkedin"]) {
    if (cookieStore.get(`${COOKIE_PREFIX}${name}`)?.value) {
      platforms.push(name);
    }
  }
  return platforms;
}

// --- Scheduled posts stored in-memory (ephemeral) ---
// For durable scheduling, use Vercel Cron + an external store later.

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

const scheduledPosts: ScheduledPost[] = [];
let nextId = 1;

export function addScheduledPost(text: string, platform: string, scheduledAt: string) {
  const id = nextId++;
  scheduledPosts.push({
    id,
    text,
    platform,
    scheduledAt,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  return id;
}

export function getPendingPosts(): ScheduledPost[] {
  const now = new Date().toISOString();
  return scheduledPosts.filter(
    (p) => p.status === "pending" && p.scheduledAt <= now
  );
}

export function markPostComplete(id: number, error?: string) {
  const post = scheduledPosts.find((p) => p.id === id);
  if (post) {
    if (error) {
      post.status = "failed";
      post.error = error;
    } else {
      post.status = "posted";
      post.postedAt = new Date().toISOString();
    }
  }
}
