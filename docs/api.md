# AURIXA Platform — API Reference (Backend)

The backend (`backend/`) exposes the platform API layer. Base URL: your deployment origin, prefix `/api` (Strapi default). All examples use JSON. No secrets, private URLs, or client data appear in this document.

> The public frontend snapshot in this repository does not call these endpoints yet — this API layer is the intended integration boundary.

---

## 1. Properties (Strapi core REST)

Standard Strapi v5 REST endpoints generated from the `Property` content type. Access per verb for public/authenticated callers is governed by users-permissions role configuration (nothing is hard-coded public).

| Method | Path | Description |
|---|---|---|
| GET | `/api/properties` | List properties (pagination: default 25, max 100, count included) |
| GET | `/api/properties/:documentId` | Fetch one property |
| POST/PUT/DELETE | `/api/properties…` | Available per role permissions (typically admin-only) |

Property attributes: `title` (required), `price` (required, decimal), `images` (media), `ai_metadata` (json), `ai_description` (text). Draft & publish is enabled.

Populate images:

```
GET /api/properties?populate=images
```

## 2. AI enrichment (custom, admin-only)

```
POST /api/properties/:id/ai-enrich
```

- **Auth:** Strapi admin session — protected by the `admin::isAuthenticatedAdmin` policy.
- **Body (optional):** `{ "imageUrl": "https://…" }` to override the analysed image.
- **Behaviour:** runs the Restb.ai → OpenAI pipeline for the property and saves `ai_metadata` + `ai_description`.
- **AI enrichment details:** Restb.ai `multianalyze` is called with all property image URLs and solutions `c1c6`, `q1q6`, `roomtype`, `features`, `caption`; on success, OpenAI (gpt-4o, temperature 0.2) generates a conservative Brazilian-Portuguese listing description grounded strictly in the vision data.
- **Failure behaviour:** `400` for missing/invalid input or when Restb.ai returns an `error: true` body (error details included); `404` if the property does not exist; `500` for missing API key, non-OK Restb.ai responses, or timeouts. On any Restb.ai error nothing is persisted and OpenAI is not called.

The same pipeline also runs automatically in the property **update lifecycle** when images are present and API keys are configured; when keys are absent, enrichment is skipped gracefully.

## 3. Lead inquiries (custom, public)

```
POST /api/inquiries
```

- **Auth:** none (`auth: false`).
- **Sanitisation & validation:** all strings are control-character-stripped, trimmed, and hard length-capped (name ≤120, email ≤255, phone ≤30, message ≤2000); `name` is required; at least one of `email` (regex-validated) or `phone` is required.

Request body (top-level or wrapped in `data`):

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "phone": "+55 13 99999-0000",
  "message": "Tenho interesse neste imóvel.",
  "property": {
    "id": 1,
    "documentId": "abc123",
    "title": "Apartamento Frente Mar",
    "slug": "apartamento-frente-mar",
    "price": 1250000,
    "location": "Santos, SP"
  },
  "routing": { "assigned_agent_id": 7, "assigned_agent_name": "Agent Name" },
  "metadata": {
    "pagePath": "/imoveis/apartamento-frente-mar",
    "locale": "pt-BR",
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "campanha-2026"
  }
}
```

Success response:

```json
{ "ok": true, "id": 12, "status": "forwarded", "mode": "forwarded" }
```

**n8n forwarding behaviour:**

- Every inquiry is persisted regardless of webhook outcome.
- If `N8N_WEBHOOK_URL` is configured, the structured payload is forwarded server-side (10 s timeout); the record stores `forwarded_at` on success or `forward_error` on failure. The webhook URL is never exposed to the client.
- If not configured, the response `status`/`mode` is `payload_ready_no_webhook_configured`.
- Validation failures return `400` with a clear message.

## 4. Admin & CMS endpoints

The Strapi admin panel (`/admin`) and its private API handle content management, the media library (backed by Cloudinary), and roles/permissions — standard Strapi v5, not customised in this project.

## 5. External integrations (server-side only)

| Integration | Direction | Trigger |
|---|---|---|
| Restb.ai `multianalyze` | outbound | property update lifecycle / ai-enrich endpoint |
| OpenAI Chat Completions | outbound | after successful Restb.ai analysis |
| Cloudinary | outbound | media upload via admin panel |
| n8n webhook | outbound | inquiry creation |

All integration credentials/URLs live in environment variables and are never returned by any endpoint.
