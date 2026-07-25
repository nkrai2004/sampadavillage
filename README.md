# Sampada Village — Website

A static, multi-page website for Sampada Village (mud-and-thatch farm stay), built with plain HTML/CSS/JS so it can be hosted directly on **GitHub Pages** — no build step required.

## Pages

- `index.html` — Home
- `about.html` — Our Story
- `cottages.html` — Cottages / accommodation
- `experiences.html` — Experiences & celebrations
- `gallery.html` — Photo gallery with lightbox
- `contact.html` — Enquiry form, contact details, map

## Structure

```
/
├── index.html
├── about.html
├── cottages.html
├── experiences.html
├── gallery.html
├── contact.html
├── css/style.css
├── js/main.js
├── images/            (site photos)
└── .nojekyll
```

## Deploying to GitHub Pages

1. Create a new repository on GitHub (e.g. `sampada-village`).
2. Push all the files in this folder to the repository's default branch (`main`):
   ```bash
   git init
   git add .
   git commit -m "Sampada Village website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Under **Branch**, select `main` and folder `/ (root)`, then **Save**.
6. GitHub will publish the site at:
   `https://<your-username>.github.io/<your-repo>/`
   (or your custom domain, if you add a `CNAME` file).

The included `.nojekyll` file tells GitHub Pages to skip Jekyll processing, which keeps folders like `css/` and `js/` serving exactly as-is.

## Before you publish — things to personalize

- **Enquiry form**: `contact.html` posts to `https://formsubmit.co/your-email@sampadavillage.com`. Swap in your real inbox address (and confirm the activation email FormSubmit sends on first submit), or replace the `<form>` action with your own backend/Formspree/Google Form.
- **Map**: the embedded map in `contact.html` searches for "Sampada Village" by name. Replace the `src` URL with your exact coordinates for a pin-accurate embed.
- **Phone / WhatsApp**: currently set to `+91 99103 56281` — update every `tel:` and `wa.me` link if this changes.
- **Website link**: footer/contact link to `sampadavillage.com`.

## Notes

- Fonts (Yeseva One, Karla) load from Google Fonts via CDN — no local font files needed.
- All interactivity (mobile menu, scroll reveal, gallery lightbox) lives in `js/main.js`, vanilla JS, no dependencies.
- Images are compressed for the web; replace anything in `/images` with higher-resolution originals if you have them.
