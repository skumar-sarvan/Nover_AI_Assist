# Nover AI Demo

Internal demo of AI-generated copy (SEO, product descriptions, blog intros) for the Nover admin portal.

- `api/generate.js`: POST endpoint that calls Claude (`claude-opus-5-5`) with the official Anthropic SDK.
- `api/health.js`: GET endpoint to confirm the deployment is up.
- `public/index.html`: a simple page to try the API.

The Anthropic key stays on the server. The browser only sends the demo key.

## Run locally

```bash
cd ai-demo
npm install
cp .env.example .env.local     # then fill in both values
npx vercel dev                 # needs: npm i -g vercel
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this repo to Git, or use `vercel` from this folder.
2. Import the project in Vercel. **Set Root Directory to `ai-demo`** if you import the whole Nover.Web repo.
3. Add environment variables (Production and Preview):
   - `ANTHROPIC_API_KEY`
   - `DEMO_API_KEY`
   - `ALLOWED_ORIGINS` (for example `http://localhost:4200,https://<admin-domain>`; needed for calls from another site)
4. Deploy. Then check `https://<your-project>.vercel.app/api/health`.

## Test the API

```bash
curl -X POST https://<your-project>.vercel.app/api/generate \
  -H "Authorization: Bearer <DEMO_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"task":"seo","brief":"Heavy-duty steel shelving for warehouses. Boltless, 300kg per shelf, made in Australia."}'
```

Tasks: `seo`, `product-description`, `blog-intro`.

Response:

```json
{
  "task": "seo",
  "model": "claude-opus-5-5",
  "text": "...",
  "usage": { "inputTokens": 0, "outputTokens": 0 }
}
```

Errors: `400` bad input, `401` wrong or missing key, `405` not POST, `422` model declined, `500` server not configured, `502`/upstream status for AI errors.

## Blog endpoints (Nover admin portal)

- `POST /api/blog-page`: full blog post draft from a brief. Body: `{ "brief": "..." }`.
- `POST /api/blog-edit`: rewrite parts of a copy of an existing post. Returns new SEO fields and replacement text for the headings and text blocks that need to change, keyed by block id. Both use `Authorization: Bearer <DEMO_API_KEY>`.

`/api/blog-edit` request:

```json
{
  "instruction": "Rewrite for Melbourne instead of Sydney and update pricing to start from $450.",
  "source": {
    "title": "...", "excerpt": "...",
    "metaTitle": "...", "metaDescription": "...", "metaKeywords": "...",
    "texts": [ { "id": "el12", "kind": "heading", "text": "..." } ]
  }
}
```

Response: `{ "page": { title, slug, excerpt, metaTitle, metaDescription, metaKeywords }, "edits": [ { "id", "text" } ], "warnings": [], "usage": { ... } }`.

Limits: instruction 10 to 2,000 characters; at most 150 text blocks and 40,000 characters of text. Edits for unknown ids, repeated ids, empty text or unchanged text are dropped. Errors match `/api/blog-page` (`400`, `401`, `422`, `502`, upstream status). The admin portal side is described in `docs/ai-blog-edit.md` in Nover.Web.

## Limits and next steps (not for production yet)

- **Demo key is a shared secret.** Anyone with it can spend credit. Rotate it after the demo.
- **No per-user rate limit or logging.** Add before wider use.
- **Production auth:** verify the user's Microsoft Entra ID token instead of a shared key (the Angular app already signs users in with MSAL).
- **Spend cap:** set a monthly limit on the Anthropic key.
- Keep `ANTHROPIC_API_KEY` out of the Angular bundle. This project already does that.
