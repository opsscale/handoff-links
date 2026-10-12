// The site side of handoff links (SPEC.md), with no dependencies.
// Storage is an in-memory Map here; use your database in practice.
import { createHash, randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN = /^[A-Za-z0-9]{24}$/;
const DAY = 86_400_000;
const links = new Map(); // sha256(token) -> { kind, value, currency, expiresAt, opener, converted }

const hash = (token) => createHash("sha256").update(token).digest("hex");

/** 1. An agent built something: mint a link to hand it. */
export function mintHandoff(artifactUrl, { kind = "other", value = null, currency = null, days = 30 } = {}) {
  const token = Array.from({ length: 24 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  links.set(hash(token), { kind, value, currency, expiresAt: Date.now() + Math.min(days, 90) * DAY, opener: null, converted: false });
  const url = new URL(artifactUrl);
  url.searchParams.set("pl_ho", token);
  return url.toString(); // give this to the agent; never store the token itself
}

/** 2. A request arrived: record the open. `isPerson` comes from your own bot detection. */
export function recordOpen(requestUrl, { visitId, isPerson }) {
  const token = new URL(requestUrl).searchParams.get("pl_ho");
  if (!token || !TOKEN.test(token)) return null; // malformed: ignore silently
  const link = links.get(hash(token));
  if (!link || link.expiresAt < Date.now()) return null; // unknown or expired: ignore silently
  // Credit the first person, even after a link preview or agent opened it.
  if (!link.opener || (!link.opener.isPerson && isPerson)) link.opener = { visitId, isPerson };
  return link;
}

/** 3. The visit converted: if it opened a handoff link, the handoff converted. */
export function recordConversion(visitId) {
  for (const link of links.values()) if (link.opener?.visitId === visitId && link.opener.isPerson) link.converted = true;
}

// Strip pl_ho from URLs before you log or store them (SPEC.md, "The site", step 6).
export const stripToken = (u) => {
  const url = new URL(u);
  url.searchParams.delete("pl_ho");
  return url.toString();
};
