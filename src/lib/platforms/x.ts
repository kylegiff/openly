import { TwitterApi } from "twitter-api-v2";
import { getAccount } from "../db";

export async function postToX(text: string) {
  const creds = getAccount("x");
  if (!creds) throw new Error("X account not connected. Go to /settings to connect.");

  const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: creds.accessToken,
    accessSecret: creds.accessSecret,
  });

  const result = await client.v2.tweet(text);
  return { id: result.data.id };
}

export function getXAuthUrl() {
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
  });

  return client.generateAuthLink(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/x/callback`,
    { linkMode: "authorize" }
  );
}

export async function handleXCallback(oauthToken: string, oauthVerifier: string, oauthTokenSecret: string) {
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: oauthToken,
    accessSecret: oauthTokenSecret,
  });

  const { accessToken, accessSecret, screenName } = await client.login(oauthVerifier);
  return { accessToken, accessSecret, screenName };
}
