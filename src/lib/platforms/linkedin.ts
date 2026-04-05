import { getAccount } from "../db";

const LINKEDIN_API = "https://api.linkedin.com/v2";

export async function postToLinkedIn(text: string) {
  const creds = await getAccount("linkedin");
  if (!creds) throw new Error("LinkedIn account not connected. Go to /settings to connect.");

  // Get user's person URN
  const meRes = await fetch(`${LINKEDIN_API}/userinfo`, {
    headers: { Authorization: `Bearer ${creds.accessToken}` },
  });

  if (!meRes.ok) {
    const err = await meRes.text();
    throw new Error(`LinkedIn auth failed: ${err}`);
  }

  const me = await meRes.json();
  const personUrn = `urn:li:person:${me.sub}`;

  // Create post using the Community Management API
  const postRes = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202401",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: personUrn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
    }),
  });

  if (!postRes.ok) {
    const err = await postRes.text();
    throw new Error(`LinkedIn post failed: ${err}`);
  }

  const postId = postRes.headers.get("x-restli-id") || "unknown";
  return { id: postId };
}

export function getLinkedInAuthUrl() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`,
    scope: "openid profile w_member_social",
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

export async function handleLinkedInCallback(code: string) {
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`LinkedIn token exchange failed: ${err}`);
  }

  const tokens = await tokenRes.json();
  return {
    accessToken: tokens.access_token,
    expiresIn: tokens.expires_in,
  };
}
