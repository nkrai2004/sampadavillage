# Leaf CRM — WhatsApp Leads, Step by Step

You'll use three free things together:

- **Meta WhatsApp Cloud API** — the official way for a program to send/receive WhatsApp messages
- **Google Sheets + Apps Script** — your database and backend, no server to manage
- **GitHub Pages** — hosts the CRM screen you'll actually use

Nothing here costs money at this scale. Budget about 45–60 minutes for first-time setup.

---

## Part 1 — Create your WhatsApp Cloud API test account

1. Go to https://developers.facebook.com and log in (or create a Meta developer account).
2. Click **My Apps → Create App**. Choose type **Business**, give it any name (e.g. "Leaf CRM").
3. On the app dashboard, find **WhatsApp** in the product list and click **Set up**.
4. Meta gives you a **test phone number** for free, plus a temporary access token, and a **Phone Number ID** — you'll see all three on the WhatsApp → API Setup screen. Copy these three things somewhere safe:
   - Temporary access token
   - Phone Number ID
   - Your test WhatsApp number
5. Under **To** on that same screen, add your own personal WhatsApp number and verify it with the code WhatsApp sends you. This lets you message the test number from your phone during setup.
6. Send a test message from your phone to the test number now, and send a reply from the API Setup screen's "Send message" box — just to confirm the number works. You should see it arrive on your phone.

> The temporary token expires in 24 hours. Once everything works, come back and generate a **permanent token** (System User token) under **Business Settings → System Users** — the setup guide from Meta walks you through this, or ask me later and I'll write those steps out too.

---

## Part 2 — Create the Google Sheet database

1. Go to https://sheets.google.com and create a new blank spreadsheet. Name it "WhatsApp CRM Data".
2. You don't need to create tabs manually — the script will create a **Leads** tab and a **Messages** tab automatically the first time it runs.

---

## Part 3 — Add the Apps Script backend

1. In your new Sheet, click **Extensions → Apps Script**.
2. Delete anything in the editor and paste in the entire contents of **Code.gs** (provided alongside this guide).
3. Click the **Save** icon (💾).
4. Click **Project Settings** (gear icon on the left) → scroll to **Script Properties** → **Add script property**. Add these three, one at a time:

   | Property | Value |
   |---|---|
   | `VERIFY_TOKEN` | any word you invent, e.g. `leafcrm2026` |
   | `ACCESS_TOKEN` | the access token from Part 1 |
   | `PHONE_NUMBER_ID` | the Phone Number ID from Part 1 |

5. Go back to the editor. Click **Deploy → New deployment**.
6. Click the gear icon next to "Select type" → choose **Web app**.
7. Fill in:
   - Description: `Leaf CRM backend`
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**. The first time, Google will ask you to authorize the script — click through the consent screens (it's your own script, so this is expected; click "Advanced → Go to Leaf CRM (unsafe)" if that warning appears — it's just Google being cautious about unverified apps).
9. Copy the **Web app URL** it gives you (ends in `/exec`). This is your backend address — you'll paste it in two places below.

---

## Part 4 — Connect WhatsApp to your backend (the webhook)

1. Back in the Meta developer dashboard, go to **WhatsApp → Configuration**.
2. Under **Webhook**, click **Edit**.
3. **Callback URL**: paste your Apps Script `/exec` URL from Part 3.
4. **Verify token**: type the exact same value you set as `VERIFY_TOKEN` in Script Properties.
5. Click **Verify and save**. If it fails, double check the verify token matches exactly and that the deployment's access is set to "Anyone".
6. Once saved, click **Manage** next to Webhook fields and subscribe to the **messages** field.

From now on, any WhatsApp message sent to your test number is automatically saved into your Google Sheet as a lead (if it's a new phone number) or a new message (if the lead already exists).

Test it: send another WhatsApp message from your phone to the test number, then check your Google Sheet — a new row should appear in **Leads** and **Messages** within a few seconds.

---

## Part 5 — Put the CRM screen on GitHub Pages

1. Go to https://github.com and create a new repository, e.g. `whatsapp-crm`. Make it public.
2. Click **Add file → Upload files**, and upload **index.html** (provided alongside this guide).
3. Commit the upload.
4. Go to the repo's **Settings → Pages**.
5. Under **Build and deployment → Source**, choose **Deploy from a branch**. Branch: `main`, folder: `/ (root)`. Save.
6. GitHub gives you a URL like `https://yourusername.github.io/whatsapp-crm/`. It can take a minute to go live.

---

## Part 6 — Connect the CRM screen to your backend

1. Open your GitHub Pages URL.
2. At the top, paste your Apps Script `/exec` URL (from Part 3) into the **Apps Script URL** box.
3. Click **Connect**.
4. You should see your leads appear on the left, with chat history on the right when you click one.

Optional but recommended: rather than pasting the URL every time, open `index.html`, find this line near the top of the `<script>` section:

```js
const CONFIG = { API_URL: "" };
```

and put your URL inside the quotes, e.g. `API_URL: "https://script.google.com/macros/s/AKfyc.../exec"`. Re-upload the file to GitHub and it will connect automatically going forward.

---

## What you can do in the CRM

- **New WhatsApp enquiries become leads automatically** — first message from a new number creates a lead with status "New".
- Click a lead to see the **full chat history** and **edit fields**: name, phone, status (New/Contacted/Qualified/Won/Lost), source, notes. Click **Save changes**.
- **Reply to WhatsApp from the CRM** using the reply box at the bottom of the chat — this sends via the WhatsApp API and logs it in the thread.
- **Add a lead manually** (e.g. a phone enquiry or referral) with the button in the sidebar.
- Filter leads by status, or search by name/phone.
- The screen auto-refreshes every 15 seconds.

---

## Good to know / limitations

- **24-hour reply window:** WhatsApp only lets businesses freely reply within 24 hours of the customer's last message. Outside that window, you need a pre-approved "template" message — a Meta rule, not something this tool controls. If a reply fails, the app will show you the error Meta returns.
- **Test number limits:** Meta's free test number can only message a short list of verified numbers and has a low daily send limit. For real customer use, you'll need to add a real business phone number under **WhatsApp → API Setup → Add phone number**, and go through Meta's business verification — I'm happy to walk you through that when you're ready.
- **This is a small-team tool, not enterprise-grade:** Google Sheets is fine for hundreds to low thousands of leads; if you outgrow it, the same Apps Script approach can point to a proper database instead.
- **Security note:** the Apps Script web app is set to "Anyone" access so your CRM page and WhatsApp's webhook can both reach it — but only someone who has your unique `/exec` URL can call it, and it doesn't expose your Sheet directly. Don't publish the URL publicly.

---

## If something doesn't work

- **Webhook verification fails:** verify token in Meta must exactly match `VERIFY_TOKEN` in Script Properties (case-sensitive, no extra spaces).
- **CRM shows "Connection error":** double-check you copied the full `/exec` URL, and that the deployment access is "Anyone", not "Anyone with Google account".
- **Messages arrive in the Sheet but not the CRM:** click Connect again, or wait for the 15-second auto-refresh.
- **Sending a reply fails:** check the error message shown — it's usually either the 24-hour window (see above) or an expired temporary access token (generate a new one and update the `ACCESS_TOKEN` script property).

Once this is working, natural next steps I can help with: a permanent access token so it doesn't expire, adding your real business number, simple automation rules (e.g. auto-tag leads mentioning "price"), or exporting reports.
