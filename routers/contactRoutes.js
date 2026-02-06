const express = require('express');
const contactService = require('../services/contactService');

const router = express.Router();

router.post('/', async (req, res) => {
  const payload = {
    name: req.body.Name || req.body.name || null,
    company: req.body.Company || req.body.company || null,
    email: req.body['E-mail'] || req.body.email || null,
    phone: req.body.Phone || req.body.phone || null,
    message: req.body.Message || req.body.message || null,
    ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
    userAgent: req.headers['user-agent'] || null
  };

  try {
    await contactService.saveContactRequest(payload);
  } catch (err) {
    console.error('[Contact] DB save failed:', err.message || err);
  }

  try {
    await contactService.sendDiscordWebhook(payload);
  } catch (err) {
    console.error('[Contact] Webhook failed:', err.message || err);
  }

  try {
    await contactService.sendEmailNotification(payload);
  } catch (err) {
    console.error('[Contact] Email failed:', err.message || err);
  }

  res.json({ ok: true });
});

module.exports = router;
