export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const secret = process.env.CRON_SECRET;

  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).send("Unauthorized");
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) {
    return res.status(500).send("Webhook URL is not configured");
  }

  const test = req.query.test === "1";

  const content = test
    ? "Test successful! Your Discord webhook and Vercel function are connected. No @everyone ping was sent."
    : "# @everyone ACTIVITY CHECK!\n" +
      "**Put a check so I know you’re active! " +
      "This gives you a better chance of getting mod**";

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      allowed_mentions: { parse: test ? [] : ["everyone"] }
    })
  });

  if (!response.ok) {
    console.error("Discord webhook failed:", response.status);
    return res.status(502).send("Discord rejected the message");
  }

  return res.status(200).send(test ? "Test message sent!" : "Activity check sent!");
}
