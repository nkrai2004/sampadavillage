# Sampada Village — Website Build

## Structure
```
/index.html                  Homepage
/stay.html                   Overnight Stay
/day-visit.html              Day Visit
/couple-getaway.html         Couple Getaway
/family-getaway.html         Family Getaway
/corporate-offsite.html      Corporate Offsite
/weddings.html                Weddings & Private Events
/assets/css/style.css        Shared design system (colors, type, components)
/assets/js/main.js           Shared behaviour: nav, sticky CTA, WhatsApp+UTM, FAQ accordion, form
/assets/img/                 Property photography
```

## To view
Open `index.html` in a browser. No build step — plain HTML/CSS/JS.

## To deploy
Upload this whole folder as-is to any static host (Netlify, Vercel, S3+CloudFront, cPanel, etc.)
or point your existing sampadavillage.com hosting at this folder.

## To extend with more pages
Every page follows the same shell: header nav → hero → content sections → FAQ →
booking/CTA → footer → sticky mobile CTA → shared JS. To add a new page
(e.g. `/farm-experience.html`), copy the pattern in `stay.html`, reuse the CSS
classes already defined in `assets/css/style.css` (`.hero`, `.split`, `.pkg-grid`,
`.card-grid`, `.faq-list`, `.review-grid`, `.booking`), and add the page to the
nav dropdown in every page's header (or better — extract the header/footer into
a templating system / CMS partial once you're ready to scale past static HTML).

## Analytics
`assets/js/main.js` pushes to `window.dataLayer` for: `page_view`, `whatsapp_click`,
`call_click`, `form_submit`, `cta_click`. Wire a GTM container (or GA4 directly)
to read these events — no code changes needed on the page side.

## WhatsApp number
Set once, in `assets/js/main.js` → `WHATSAPP_NUMBER`. Update it there and every
WhatsApp button on the site updates automatically.
