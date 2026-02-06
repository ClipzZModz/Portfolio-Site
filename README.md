# Portfolio Site

Personal portfolio website for Jack showcasing technical abilities, case studies, reviews, and work highlights.

## Stack
- Node.js
- Express
- EJS
- MySQL

## Structure
- `assets/`: Static files (CSS, JS, images, fonts)
- `views/`: EJS templates
- `routers/`: Route modules
- `services/`: DB, contact, and integrations
- `storage/`: SQL init scripts
- `bin/`: Server entry (`www`)

## Local Development
1. `npm install`
2. `npm run dev`

## Environment
Set these in your environment or a `.env` file:
- `PORT` (default: `5000`)
- `NODE_ENV` (`development` or `production`)
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DISCORD_WEBHOOK` (optional)
- `SMTP_HOST` (production only)
- `SMTP_PORT` (default `587`)
- `SMTP_SECURE` (`true` for SSL, `false` for STARTTLS)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_TO`

## Contact Form
Form submissions:
- Save to MySQL (`contact_requests`)
- Post to Discord via webhook
- Send SMTP email in production only

## License
See `LICENSE`.
