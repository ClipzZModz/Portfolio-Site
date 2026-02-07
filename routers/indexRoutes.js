const express = require('express');
const analyticsService = require('../services/analyticsService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await analyticsService.trackPageView(req, res);
  } catch (err) {
    console.error('[Analytics] Failed to track page view:', err.message || err);
  }
  res.render('index');
});

module.exports = router;
