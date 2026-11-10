import crypto from 'node:crypto';

// Comma-separated list, e.g. "http://localhost:4200,https://admin.example.com"
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export function applyCors(req, res) {
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}

function keysMatch(given, expected) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isAuthorised(req) {
  const expected = process.env.DEMO_API_KEY;
  const header = req.headers.authorization || '';
  if (!expected || !header.startsWith('Bearer ')) return false;
  return keysMatch(header.slice('Bearer '.length), expected);
}

/** Opus 5.5 list prices, USD per million tokens (see skill pricing table; confirm before billing use). */
export const PRICE_PER_MTOK = { model: 'claude-opus-5-5', input: 4, output: 20 };

export function estimateCostUsd(inputTokens, outputTokens) {
  const cost =
    (inputTokens * PRICE_PER_MTOK.input + outputTokens * PRICE_PER_MTOK.output) / 1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

/** Trim to a maximum length without cutting mid-word where possible. */
export function clip(text, max) {
  const value = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim();
}

export function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}
