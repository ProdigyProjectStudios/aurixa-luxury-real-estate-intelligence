import type { Core } from '@strapi/strapi';

const MAX_NAME = 120;
const MAX_EMAIL = 255;
const MAX_PHONE = 30;
const MAX_MESSAGE = 2000;
const MAX_STRING = 255;
const WEBHOOK_TIMEOUT_MS = 10000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeString = (value: unknown, maxLen: number): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, maxLen);
};

const pickPropertyRef = (raw: any) => {
  if (!raw || typeof raw !== 'object') return null;
  const ref = {
    id: raw.id ?? null,
    documentId: sanitizeString(raw.documentId, 64),
    title: sanitizeString(raw.title, MAX_STRING),
    slug: sanitizeString(raw.slug, MAX_STRING),
    price: typeof raw.price === 'number' ? raw.price : sanitizeString(raw.price, 50),
    location: sanitizeString(raw.location, MAX_STRING),
  };
  const hasAny = Object.values(ref).some((v) => v !== null && v !== undefined);
  return hasAny ? ref : null;
};

const pickRouting = (raw: any) => {
  if (!raw || typeof raw !== 'object') return null;
  const r = {
    assigned_agent_id: raw.assigned_agent_id ?? raw.agent_id ?? null,
    assigned_agent_name: sanitizeString(raw.assigned_agent_name ?? raw.agent_name, MAX_STRING),
  };
  const hasAny = Object.values(r).some((v) => v !== null && v !== undefined);
  return hasAny ? r : null;
};

const pickMetadata = (raw: any) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    pagePath: sanitizeString(raw.pagePath, MAX_STRING),
    locale: sanitizeString(raw.locale, 20),
    utmSource: sanitizeString(raw.utmSource, MAX_STRING),
    utmMedium: sanitizeString(raw.utmMedium, MAX_STRING),
    utmCampaign: sanitizeString(raw.utmCampaign, MAX_STRING),
  };
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async create(ctx) {
    const body = (ctx.request.body && (ctx.request.body.data ?? ctx.request.body)) || {};

    const name = sanitizeString(body.name, MAX_NAME);
    const email = sanitizeString(body.email, MAX_EMAIL);
    const phone = sanitizeString(body.phone, MAX_PHONE);
    const message = sanitizeString(body.message, MAX_MESSAGE);

    if (!name) {
      return ctx.badRequest('name is required');
    }
    if (!email && !phone) {
      return ctx.badRequest('at least one of email or phone is required');
    }
    if (email && !EMAIL_RE.test(email)) {
      return ctx.badRequest('email is invalid');
    }

    const propertyRef = pickPropertyRef(body.property);
    const routing = pickRouting(body.routing);
    const metadata = pickMetadata(body.metadata);
    const submittedAtIso =
      sanitizeString(body.metadata?.submittedAt, 40) ?? new Date().toISOString();

    const structuredPayload = {
      source: 'AURIXA_MVP',
      type: 'property_inquiry',
      submittedAt: submittedAtIso,
      contact: { name, email, phone },
      message,
      property: propertyRef,
      routing,
      metadata,
    };

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    let status: 'forwarded' | 'failed' | 'payload_ready_no_webhook_configured' =
      'payload_ready_no_webhook_configured';
    let forwardedAt: Date | null = null;
    let forwardError: string | null = null;

    if (webhookUrl) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
      try {
        strapi.log.info('INQUIRY - forwarding to N8N_WEBHOOK_URL');
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(structuredPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          status = 'failed';
          forwardError = `webhook responded HTTP ${res.status}: ${text.slice(0, 500)}`;
          strapi.log.error(`INQUIRY - webhook failed: ${forwardError}`);
        } else {
          status = 'forwarded';
          forwardedAt = new Date();
          strapi.log.info('INQUIRY - webhook forwarded successfully');
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        status = 'failed';
        forwardError =
          err?.name === 'AbortError'
            ? `webhook timeout after ${WEBHOOK_TIMEOUT_MS}ms`
            : `webhook error: ${err?.message ?? 'unknown'}`;
        strapi.log.error(`INQUIRY - ${forwardError}`);
      }
    } else {
      strapi.log.warn(
        'INQUIRY - N8N_WEBHOOK_URL not configured; payload stored only (mode=payload_ready_no_webhook_configured)'
      );
    }

    let savedId: number | string | null = null;
    try {
      const saved = await strapi.db.query('api::inquiry.inquiry').create({
        data: {
          name,
          email,
          phone,
          message,
          property_ref: propertyRef,
          routing,
          metadata,
          payload: structuredPayload,
          status,
          forwarded_at: forwardedAt,
          forward_error: forwardError,
        },
      });
      savedId = saved?.id ?? null;
    } catch (err: any) {
      strapi.log.error(`INQUIRY - failed to persist inquiry: ${err?.message ?? err}`);
    }

    if (status === 'failed') {
      ctx.status = 502;
      return {
        ok: false,
        id: savedId,
        status,
        error: forwardError,
      };
    }

    return {
      ok: true,
      id: savedId,
      status,
      mode: status,
    };
  },
});
