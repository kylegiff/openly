"use client";

import { useState } from "react";

type Platform = "x" | "linkedin";
type PostMode = "now" | "schedule";

export default function Home() {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState<Platform>("x");
  const [mode, setMode] = useState<PostMode>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const charLimit = platform === "x" ? 280 : 3000;
  const remaining = charLimit - text.length;

  async function handlePost() {
    if (!text.trim()) return;
    if (mode === "schedule" && !scheduledAt) {
      setStatus({ type: "error", message: "Pick a time." });
      return;
    }

    setStatus({ type: "loading" });

    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          platform,
          mode,
          scheduledAt: mode === "schedule" ? scheduledAt : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Something went wrong." });
        return;
      }

      setStatus({
        type: "success",
        message:
          mode === "now"
            ? `Posted to ${platform === "x" ? "X" : "LinkedIn"}.`
            : `Scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
      });
      setText("");
    } catch {
      setStatus({ type: "error", message: "Network error." });
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">openly</h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Say what you mean. Post it. Close this tab.
          </p>
        </div>

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          rows={5}
          className="w-full bg-transparent border border-[var(--border)] rounded-lg p-4 text-base resize-none placeholder:text-[var(--muted)] focus:border-[var(--muted)] transition-colors"
        />
        <div className="flex justify-end mt-1.5 mb-6">
          <span
            className={`text-xs tabular-nums ${
              remaining < 0
                ? "text-red-400"
                : remaining < 30
                ? "text-yellow-400"
                : "text-[var(--muted)]"
            }`}
          >
            {remaining}
          </span>
        </div>

        {/* Platform toggle */}
        <div className="flex gap-2 mb-4">
          <PlatformButton
            active={platform === "x"}
            onClick={() => setPlatform("x")}
            label="X"
          />
          <PlatformButton
            active={platform === "linkedin"}
            onClick={() => setPlatform("linkedin")}
            label="LinkedIn"
          />
        </div>

        {/* Timing toggle */}
        <div className="flex gap-2 mb-4">
          <PlatformButton
            active={mode === "now"}
            onClick={() => setMode("now")}
            label="Post now"
          />
          <PlatformButton
            active={mode === "schedule"}
            onClick={() => setMode("schedule")}
            label="Schedule"
          />
        </div>

        {/* Schedule picker */}
        {mode === "schedule" && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full bg-transparent border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--fg)] mb-4 [color-scheme:dark]"
          />
        )}

        {/* Post button */}
        <button
          onClick={handlePost}
          disabled={!text.trim() || remaining < 0 || status.type === "loading"}
          className="w-full py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200 active:scale-[0.98]"
        >
          {status.type === "loading"
            ? "Posting..."
            : mode === "now"
            ? `Post to ${platform === "x" ? "X" : "LinkedIn"}`
            : "Schedule post"}
        </button>

        {/* Status */}
        {status.type !== "idle" && status.type !== "loading" && (
          <div
            className={`mt-4 text-sm text-center ${
              status.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Connected accounts */}
        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <a
            href="/settings"
            className="text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            Connect accounts &rarr;
          </a>
        </div>
      </div>
    </main>
  );
}

function PlatformButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-white text-black"
          : "bg-transparent text-[var(--muted)] border border-[var(--border)] hover:text-[var(--fg)]"
      }`}
    >
      {label}
    </button>
  );
}
