# Sampada Village — Website + CRM

This repo hosts two things on the **same GitHub Pages site**:

- **`/`** — the public marketing site (Home, Our Story, Cottages, Experiences, Gallery, Plan Your Stay).
- **`/crm`** — an internal booking CRM (bookings/calendar, guests, payments, WhatsApp follow-ups). Not linked from navigation or search engines — reachable via a small "Staff Login" link in the site footer, or by going directly to `/crm/`.

Both are plain static HTML/CSS/JS — no build step, no server — so the whole repo deploys to GitHub Pages as-is.

## Structure

```
/
├── index.html, about.html, cottages.html, ...   ← marketing site pages
├── css/style.css, js/i18n.js, js/main.js        ← marketing site assets
├── images/                                       ← marketing site photos
│
└── crm/                                          ← internal CRM (separate app)
    ├── index.html
    ├── css/crm.css
    ├── js/store.js, whatsapp.js, App.js, ...
    └── images/
```

The two apps don't share code or styling — they're independent, just deployed together for convenience. See **`crm/README.md`** for everything about how the CRM works, its data storage, and WhatsApp setup.

## Deploying to GitHub Pages

1. Push everything in this folder to your repo's default branch (`main`), keeping the structure above intact.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**, branch `main`, folder `/ (root)` → **Save**.
4. Your site publishes at `https://<your-username>.github.io/<your-repo>/`, and the CRM at `https://<your-username>.github.io/<your-repo>/crm/`.

The included `.nojekyll` file tells GitHub Pages to skip Jekyll processing, so folders starting with `_` or nested asset folders (like `crm/css`) are served exactly as-is.

## Keeping the CRM private-ish

GitHub Pages doesn't support real authentication. The `/crm` app is kept out of search engines (`<meta name="robots" content="noindex, nofollow">`) and isn't linked from the main nav, but **the URL itself is not a secret** — anyone who knows or guesses `/crm/` can open it, and its data lives in *their own browser's* local storage (see `crm/README.md`), not a shared database, so there's no real "logging in" happening. That's fine for a low-stakes internal tool on a small team, but if the booking data becomes sensitive or multiple staff need to share the same live data, this setup should graduate to a real backend with authentication rather than relying on an unlisted URL.

## Before you publish — checklist

- **Contact form** (`contact.html`): posts to `formsubmit.co/your-email@sampadavillage.com` — swap in your real inbox.
- **Map embed** (`contact.html`): currently searches "Brijghat Garh Ganga" by name — replace with your exact coordinates for a pin-accurate embed.
- **Phone / WhatsApp**: `+91 87458 63882` is wired into `tel:` and `wa.me` links across every page and in the CRM's Settings — update everywhere if this number changes.
- **CRM WhatsApp templates**: edit the default messages in the CRM's Settings → WhatsApp to match your voice.
