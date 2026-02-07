const express = require('express');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

router.post('/event', async (req, res) => {
  const { type, name, data } = req.body || {};

  if (!type) {
    return res.status(400).json({ error: 'Missing event type.' });
  }

  try {
    await analyticsService.trackEvent(req, res, {
      eventType: String(type).slice(0, 50),
      eventName: name ? String(name).slice(0, 255) : null,
      data: data || null
    });
  } catch (err) {
    console.error('[Analytics] Failed to track event:', err.message || err);
  }

  return res.status(204).send();
});

module.exports = router;
