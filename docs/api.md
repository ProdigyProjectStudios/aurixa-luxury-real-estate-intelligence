# AURIXA Platform — API Reference

The Strapi backend exposes the platform API used by the commissioned AURIXA client system. The public repository keeps the API implementation and contracts visible while the browser-facing portfolio snapshot can run from curated local fixtures to avoid exposing private client data, credentials or deployment infrastructure.

Base path: `/api`

---

## 1. Properties

Standard Strapi v5 REST endpoints generated from the `Property` content type.

| Method | Path | Description |
|---|---|---|
| GET | `/api/properties` | List properties |
| GET | `/api/properties/:documentId` | Fetch one property |
| POST/PUT/DELETE | `/api/properties…` | Available according to configured role permissions |

Property attributes include `title`, `price`, `images`, `ai_metadata` and `ai_description`. Draft & publish is enabled.

Populate images:

```http
GET /api/properties?populate=images
```

In the delivered client architecture, the React frontend consumed these property endpoints for platform data. The public portfolio frontend may instead use checked-in fixture data so the repository can be reviewed and run without production client infrastructure.

## 2. AI enrichment — admin-only

```http
POST /api/properties/:id/ai-enrich
```

- **Auth:** Strapi admin session
- **Behaviour:** runs the Restb.ai → OpenAI enrichment pipeline and stores `ai_metadata` plus `ai_description`
- **Failure handling:** invalid input, provider errors and timeouts abort safely without persisting invalid enrichment

The enrichment pipeline also runs from the property update lifecycle when images and required provider credentials are present.

## 3. Lead inquiries — public

```http
POST /api/inquiries
```

- **Auth:** none (`auth: false`)
- **Validation:** `name` required; at least one of email or phone required
- **Sanitisation:** strings are control-character stripped, trimmed and length-capped before persistence

Example request:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "phone": "+55 13 99999-0000",
  "message": "Tenho interesse neste imóvel.",
  "property": {
    "documentId": "abc123",
    "title": "Apartamento Frente Mar",
    "price": 1250000,
    "location": "Santos, SP"
  },
  "routing": {
    "assigned_agent_id": 7,
    "assigned_agent_name": "Agent Name"
  },
  "metadata": {
    "pagePath": "/imoveis/apartamento-frente-mar",
    "locale": "pt-BR",
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "campanha-2026"
  }
}
```

Example success response:

```json
{ "ok": true, "id": 12, "status": "forwarded", "mode": "forwarded" }
```

### n8n forwarding behaviour

- Every valid inquiry is persisted regardless of webhook outcome.
- When `N8N_WEBHOOK_URL` is configured, the structured payload is forwarded server-side.
- Successful forwarding stores `forwarded_at`; failures store `forward_error`.
- The webhook URL is never returned to the client.
- When no webhook is configured, the record remains persisted with `payload_ready_no_webhook_configured` state.

## 4. Admin & CMS

The Strapi admin panel handles:

- Property content management
- Media management through Cloudinary
- Draft / publish state
- Roles and permissions
- AI enrichment operations

## 5. External integrations

| Integration | Direction | Trigger |
|---|---|---|
| Restb.ai `multianalyze` | outbound | property update lifecycle / AI-enrich endpoint |
| OpenAI | outbound | after successful image analysis |
| Cloudinary | outbound | media upload / delivery |
| n8n webhook | outbound | inquiry creation |

All provider credentials and private deployment URLs are environment-driven and are not committed.

## Portfolio packaging note

The API layer documented here is part of the integrated full-stack client architecture. The fact that the public frontend snapshot can run from local fixtures is intentional portfolio sanitisation, not an indication that the commissioned frontend and backend were never connected.
