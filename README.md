# openly

Post to X and LinkedIn without opening the apps. No feed. No distractions. Just say what you mean.

## Why

Social media apps are designed to keep you scrolling. But sometimes you genuinely want to share something with people who matter to you. **openly** lets you write your post, choose where it goes, and close the tab. That's it.

## Features

- **Text box** — write your post
- **Platform selector** — X or LinkedIn
- **Post now or schedule** — your call
- Dark, minimal UI. No feed. No notifications. No algorithmic nonsense.

## Setup

### 1. Clone and install

```bash
git clone https://github.com/kylegiff/openly.git
cd openly
bun install
```

### 2. Create API credentials

**X (Twitter):**
1. Go to [developer.x.com](https://developer.x.com)
2. Create a new app with OAuth 1.0a (read + write)
3. Set callback URL to `http://localhost:3000/api/auth/x/callback`
4. Copy your API Key and API Secret

**LinkedIn:**
1. Go to [linkedin.com/developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add products: "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect"
4. Set redirect URL to `http://localhost:3000/api/auth/linkedin/callback`
5. Copy your Client ID and Client Secret

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`.

### 4. Run it

```bash
bun dev
```

Open [localhost:3000/settings](http://localhost:3000/settings) to connect your accounts, then go to [localhost:3000](http://localhost:3000) to post.

### Scheduling

Scheduled posts are stored in a local SQLite database. To process them, hit the cron endpoint:

```bash
curl "http://localhost:3000/api/cron?token=YOUR_CRON_SECRET"
```

Set this up as a cron job (every minute) or use Vercel Cron in production.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kylegiff/openly)

> **Note:** For Vercel deployment, you'll need to swap SQLite for a hosted database (Turso, PlanetScale, etc). The local SQLite setup works great for personal use.

## Tech

- Next.js 15 (App Router)
- Tailwind CSS v4
- SQLite via better-sqlite3
- twitter-api-v2
- LinkedIn REST API

## License

MIT
