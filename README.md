# Amul Stock Tracker & Telegram Alert Bot on Cloudflare Workers

A continuous product stock monitoring Cloudflare Worker that scans [shop.amul.com](https://shop.amul.com) for high-demand protein items, dispatches instant Telegram alerts when products become available or stock changes, and provides an interactive web Admin Panel to manage credentials, tracking keywords, and store settings.

---

## Features

- **Continuous Background Scanning**: Runs automatically every minute via Cloudflare Worker Cron Triggers (`scheduled` event).
- **Dual Notification Channels**:
  - **Telegram Bot**: Instant rich HTML formatted restock alerts.
  - **Self-Hosted ntfy on Render**: High-priority push notifications directly to iOS, Android, and Web browsers with 1-tap "Buy Now" links.
- **Default Tracked Products**:
  - **Protein Lassi** (*Amul High Protein Plain Lassi* & *Amul High Protein Rose Lassi*)
  - **Protein Buttermilk** (*Amul High Protein Buttermilk*)
  - **Blueberry Protein Shake** (*Amul High Protein Blueberry Shake*)
- **Admin Panel UI**:
  - Live stock cards with real-time in-stock/out-of-stock badges, units available, and prices.
  - One-click **"Scan Now"** button with immediate live feedback.
  - **Telegram & ntfy Credential Managers**: Add and update credentials with one-click test buttons.
  - **Tracked Products Manager**: Add, edit, toggle, or delete tracking keywords and product rules.
  - **Store Catalog Explorer**: Browse all 23+ products currently in the Amul store category and track any in 1 tap.
  - **Amul API Configuration**: Edit substore warehouse ID, category, or cookies.
  - **Activity & Scan Logs**: Audit trail of recent scans, matched products, and notifications sent.
- **Dynamic Amul Authentication**: Computes fresh SHA-256 `tid` signatures and manages session tokens for Amul's API.
- **Alert Cooldown Control**: Prevents repetitive spam when a product stays in stock across multiple scans.
- **Cloudflare KV Persistence**: Stores configuration, stock states, and scan history.

---

## Quick Start (Local Development)

The worker can be run and tested locally right away with full KV simulation:

```bash
# 1. Install dependencies
npm install

# 2. Type-check TypeScript code
npm run typecheck

# 3. Start local development server
npm run dev
```

Open **http://localhost:8787** in your browser to access the Admin Panel!

- **Admin Password**: Configured via `DEFAULT_ADMIN_PASSWORD` in `wrangler.jsonc` (can be changed in the UI)

---

## Telegram Bot Setup (30 Seconds)

1. **Get a Bot Token**:
   - Open Telegram and search for [@BotFather](https://t.me/BotFather).
   - Send `/newbot` and follow the prompts to name your bot.
   - Copy the HTTP API token (e.g. `7123456789:AAFxz_...`).

2. **Get your Chat ID**:
   - Start a conversation with your new bot and click **Start**.
   - Open Telegram and message [@userinfobot](https://t.me/userinfobot).
   - Copy the numerical ID it replies with (e.g. `123456789`).
   - *(Optional for Groups/Channels)*: Add your bot to a Telegram group or channel and use the group/channel ID.

3. **Configure in Admin Panel**:
   - Open the **Telegram Settings** tab in your Admin Panel.
   - Paste your **Bot Token** and **Chat ID**.
   - Click **"Send Test Notification"** to verify delivery.
   - Click **"Save Telegram Settings"**.

---

## Deploying to Cloudflare

Deploying to Cloudflare takes less than 2 minutes:

### 1. Authenticate with Cloudflare

Run:
```bash
npx wrangler login
```
*Or set the `CLOUDFLARE_API_TOKEN` environment variable in your terminal:*
```bash
export CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
```

### 2. Create the Cloudflare KV Namespace

Create the production KV namespace for state and configuration:
```bash
npx wrangler kv namespace create AMUL_TRACKER_KV
```

You will see output like:
```
Add the following to your configuration file:
[[kv_namespaces]]
binding = "AMUL_TRACKER_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Update `wrangler.jsonc` with your production KV namespace ID:
```jsonc
"kv_namespaces": [
  {
    "binding": "AMUL_TRACKER_KV",
    "id": "your-production-kv-id-here"
  }
]
```

### 3. Deploy

Deploy the worker:
```bash
npm run deploy
```

Wrangler will output your live URL (e.g. `https://amul-stock-tracker.<your-subdomain>.workers.dev`).

Open the URL in any browser to access your deployed Admin Panel!

---

## Project Structure

```
├── src/
│   ├── index.ts        # Cloudflare Worker router & cron scheduled trigger
│   ├── amul.ts         # Amul API client with dynamic SHA-256 tid generation
│   ├── scanner.ts      # Product matching engine, state tracker & alert dispatcher
│   ├── telegram.ts     # Telegram Bot API notification client
│   ├── admin.ts        # Responsive web Admin Panel (Tailwind CSS SPA)
│   └── types.ts        # TypeScript data definitions
├── wrangler.jsonc      # Cloudflare Worker configuration & Cron triggers
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Web Admin Panel UI |
| `GET` | `/api/health` | Public health check |
| `GET` | `/api/config` | Retrieve active configuration |
| `POST` | `/api/config/telegram` | Save Telegram Bot Token and Chat ID |
| `POST` | `/api/config/amul` | Save Amul substore ID, cookies, and scanning toggle |
| `GET` | `/api/dashboard` | Live product inventory, matched items, and stats |
| `POST` | `/api/scan` | Trigger manual scan immediately |
| `POST` | `/api/test-telegram` | Send test notification to Telegram |
| `POST` | `/api/test-amul` | Test connection to shop.amul.com |
| `GET` | `/api/rules` | List all tracked product rules |
| `POST` | `/api/rules` | Add new product keyword rule |
| `POST` | `/api/rules/:id/toggle` | Enable or disable a tracking rule |
| `DELETE` | `/api/rules/:id` | Delete a tracking rule |
| `GET` | `/api/logs` | Fetch recent scan activity logs |

*All `/api/*` endpoints require the `x-admin-password` header.*
