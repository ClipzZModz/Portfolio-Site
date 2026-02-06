const db = require('./database');
const nodemailer = require('nodemailer');

async function saveContactRequest(payload) {
  const {
    name,
    company,
    email,
    phone,
    message,
    ipAddress,
    userAgent
  } = payload;

  await db.query(
    `INSERT INTO contact_requests
      (name, company, email, phone, message, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, company, email, phone, message, ipAddress, userAgent]
  );
}

async function sendDiscordWebhook(payload) {
  const webhook = process.env.DISCORD_WEBHOOK;
  if (!webhook || typeof fetch !== 'function') {
    return;
  }

  const fields = [
    { name: 'Name', value: payload.name || 'N/A', inline: true },
    { name: 'Company', value: payload.company || 'N/A', inline: true },
    { name: 'Email', value: payload.email || 'N/A', inline: true },
    { name: 'Phone', value: payload.phone || 'N/A', inline: true },
    { name: 'IP', value: payload.ipAddress || 'N/A', inline: true }
  ];

  const embed = {
    title: 'New Contact Request',
    color: 0x6C5CE7,
    fields,
    description: payload.message ? payload.message.slice(0, 1900) : 'N/A',
    timestamp: new Date().toISOString(),
    footer: { text: 'jackswebsite.dev' }
  };

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] })
  });
}

function getSmtpConfig() {
  if (!process.env.SMTP_HOST) {
    return null;
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || ''
        }
      : undefined
  };
}

async function sendEmailNotification(payload) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const config = getSmtpConfig();
  if (!config || !process.env.SMTP_TO) {
    return;
  }

  const transporter = nodemailer.createTransport(config);
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@jackswebsite.dev';
  const to = process.env.SMTP_TO;

  const subject = 'New Contact Request (jackswebsite.dev)';
  const text = [
    'New Contact Request',
    `Name: ${payload.name || 'N/A'}`,
    `Company: ${payload.company || 'N/A'}`,
    `Email: ${payload.email || 'N/A'}`,
    `Phone: ${payload.phone || 'N/A'}`,
    `Message: ${payload.message || 'N/A'}`,
    `IP: ${payload.ipAddress || 'N/A'}`
  ].join('\n');

  const html = `
    <h2>New Contact Request</h2>
    <ul>
      <li><strong>Name:</strong> ${payload.name || 'N/A'}</li>
      <li><strong>Company:</strong> ${payload.company || 'N/A'}</li>
      <li><strong>Email:</strong> ${payload.email || 'N/A'}</li>
      <li><strong>Phone:</strong> ${payload.phone || 'N/A'}</li>
      <li><strong>IP:</strong> ${payload.ipAddress || 'N/A'}</li>
    </ul>
    <p><strong>Message:</strong></p>
    <p>${(payload.message || 'N/A').replace(/\n/g, '<br>')}</p>
  `;

  const replyTo = payload.email ? { replyTo: payload.email } : {};
  await transporter.sendMail({ from, to, subject, text, html, ...replyTo });
}

module.exports = { saveContactRequest, sendDiscordWebhook, sendEmailNotification };
