const crypto = require('crypto');
const db = require('./database');

const botRegex = /(bot|crawler|spider|crawling|preview|slackbot|facebookexternalhit|discordbot|telegrambot|whatsapp|pingdom|uptime|statuscake|headless|lighthouse)/i;

function parseCookies(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }
  return cookieHeader.split(';').reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) {
      return acc;
    }
    acc[rawKey] = decodeURIComponent(rawValue.join('=') || '');
    return acc;
  }, {});
}

function isBot(userAgent) {
  if (!userAgent) {
    return true;
  }
  return botRegex.test(userAgent);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || null;
}

function shouldSetSecureCookie(req) {
  if (req.secure) {
    return true;
  }
  const proto = req.headers['x-forwarded-proto'];
  return proto ? proto.split(',')[0].trim() === 'https' : false;
}

function setVisitorCookie(res, visitorId, secure) {
  const maxAgeSeconds = 60 * 60 * 24 * 365;
  const parts = [
    `visitor_id=${encodeURIComponent(visitorId)}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Lax'
  ];
  if (secure) {
    parts.push('Secure');
  }
  res.append('Set-Cookie', parts.join('; '));
}

function ensureVisitorId(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  const visitorId = cookies.visitor_id || crypto.randomUUID();
  if (!cookies.visitor_id) {
    setVisitorCookie(res, visitorId, shouldSetSecureCookie(req));
  }
  return visitorId;
}

function parsePathFromReferrer(referrer) {
  if (!referrer) {
    return null;
  }
  try {
    const url = new URL(referrer);
    return url.pathname || '/';
  } catch (err) {
    return null;
  }
}

async function trackPageView(req, res) {
  const userAgent = req.headers['user-agent'] || null;
  if (isBot(userAgent)) {
    return;
  }

  const visitorId = ensureVisitorId(req, res);
  const ipAddress = getClientIp(req);
  const referrer = req.headers.referer || req.headers.referrer || null;
  const path = req.path || '/';
  const queryString = req.originalUrl.includes('?') ? req.originalUrl.split('?')[1] : null;

  const {
    utm_source: utmSource = null,
    utm_medium: utmMedium = null,
    utm_campaign: utmCampaign = null,
    utm_term: utmTerm = null,
    utm_content: utmContent = null
  } = req.query || {};

  const pageData = {
    query_string: queryString,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    utm_content: utmContent
  };

  await db.query(
    `INSERT INTO visit_events
      (visitor_id, path, query_string, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      visitorId,
      path,
      queryString,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      ipAddress,
      userAgent
    ]
  );

  await db.query(
    `INSERT INTO visitor_events
      (visitor_id, event_type, event_name, path, referrer, data_json, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      visitorId,
      'pageview',
      path,
      path,
      referrer,
      JSON.stringify(pageData),
      ipAddress,
      userAgent
    ]
  );
}

async function trackEvent(req, res, { eventType, eventName, data }) {
  const userAgent = req.headers['user-agent'] || null;
  if (isBot(userAgent)) {
    return;
  }

  const visitorId = ensureVisitorId(req, res);
  const ipAddress = getClientIp(req);
  const referrer = req.headers.referer || req.headers.referrer || null;
  const path = parsePathFromReferrer(referrer) || '/';

  await db.query(
    `INSERT INTO visitor_events
      (visitor_id, event_type, event_name, path, referrer, data_json, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      visitorId,
      eventType,
      eventName,
      path,
      referrer,
      data ? JSON.stringify(data) : null,
      ipAddress,
      userAgent
    ]
  );
}

module.exports = { trackPageView, trackEvent };
