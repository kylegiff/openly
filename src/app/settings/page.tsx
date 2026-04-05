"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SettingsContent() {
  const [connected, setConnected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const justConnected = searchParams.get("connected");
  const error = searchParams.get("error");

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        setConnected(data.platforms || []);
        setLoading(false);
      });
  }, []);

  async function disconnect(platform: string) {
    await fetch("/api/accounts/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    setConnected((prev) => prev.filter((p) => p !== platform));
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-10">
          <a href="/" className="text-[var(--muted)] text-sm hover:text-[var(--fg)] transition-colors">
            &larr; Back
          </a>
          <h1 className="text-2xl font-semibold tracking-tight mt-4">Settings</h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Connect your accounts to post.
          </p>
        </div>

        {justConnected && (
          <div className="mb-6 text-sm text-green-400">
            Connected {justConnected === "x" ? "X" : "LinkedIn"} successfully.
          </div>
        )}

        {error && (
          <div className="mb-6 text-sm text-red-400">
            Auth error: {error.replace(/_/g, " ")}
          </div>
        )}

        {loading ? (
          <div className="text-[var(--muted)] text-sm">Loading...</div>
        ) : (
          <div className="space-y-3">
            <AccountRow
              name="X"
              platform="x"
              connected={connected.includes("x")}
              authUrl="/api/auth/x"
              onDisconnect={() => disconnect("x")}
            />
            <AccountRow
              name="LinkedIn"
              platform="linkedin"
              connected={connected.includes("linkedin")}
              authUrl="/api/auth/linkedin"
              onDisconnect={() => disconnect("linkedin")}
            />
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-[var(--border)]">
          <h2 className="text-sm font-medium mb-3">Setup guide</h2>
          <div className="text-xs text-[var(--muted)] space-y-2">
            <p>
              <strong className="text-[var(--fg)]">X:</strong> Create an app at{" "}
              developer.x.com. Enable OAuth 1.0a with read+write. Set callback URL to{" "}
              <code className="text-[var(--fg)]">http://localhost:3000/api/auth/x/callback</code>
            </p>
            <p>
              <strong className="text-[var(--fg)]">LinkedIn:</strong> Create an app at{" "}
              linkedin.com/developers. Add the &quot;Share on LinkedIn&quot; and &quot;Sign In with LinkedIn using OpenID Connect&quot; products. Set redirect URL to{" "}
              <code className="text-[var(--fg)]">http://localhost:3000/api/auth/linkedin/callback</code>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function AccountRow({
  name,
  platform,
  connected,
  authUrl,
  onDisconnect,
}: {
  name: string;
  platform: string;
  connected: boolean;
  authUrl: string;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            connected ? "bg-green-400" : "bg-[var(--muted)]"
          }`}
        />
        <span className="text-sm font-medium">{name}</span>
        {connected && (
          <span className="text-xs text-[var(--muted)]">Connected</span>
        )}
      </div>
      {connected ? (
        <button
          onClick={onDisconnect}
          className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors"
        >
          Disconnect
        </button>
      ) : (
        <a
          href={authUrl}
          className="text-xs text-[var(--fg)] bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 transition-colors"
        >
          Connect {name}
        </a>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--muted)]">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
