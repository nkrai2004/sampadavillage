/**
 * WhatsApp Lead CRM — Google Apps Script backend
 * ------------------------------------------------
 * This script:
 *  1. Receives WhatsApp Cloud API webhook events (new messages) and
 *     saves them into a Google Sheet, auto-creating a "Lead" the first
 *     time a phone number messages you.
 *  2. Serves a simple JSON API that the front-end (hosted on GitHub
 *     Pages) uses to read leads/messages, update lead fields, add a
 *     lead manually, and send a WhatsApp reply.
 *
 * SETUP (see the setup guide for full details):
 *  1. Create a Google Sheet with two tabs: "Leads" and "Messages"
 *     (this script will create them automatically if missing).
 *  2. Open Extensions > Apps Script in that Sheet, paste this file in
 *     as Code.gs.
 *  3. Go to Project Settings > Script Properties and add:
 *       VERIFY_TOKEN     -> any random string you invent, e.g. "mycrm123"
 *       ACCESS_TOKEN     -> your WhatsApp Cloud API permanent/temp token
 *       PHONE_NUMBER_ID  -> your WhatsApp Cloud API phone number ID
 *  4. Deploy > New deployment > Web app.
 *       Execute as: Me
 *       Who has access: Anyone
 *     Copy the resulting /exec URL — you'll need it twice:
 *       - as the Callback URL in Meta's WhatsApp webhook config
 *       - as API_URL in the front-end index.html
 */

const LEADS_SHEET = 'Leads';
const MESSAGES_SHEET = 'Messages';

const LEAD_HEADERS = ['LeadID', 'Name', 'Phone', 'Status', 'Source', 'Notes', 'CreatedAt', 'LastMessageAt'];
const MESSAGE_HEADERS = ['MessageID', 'LeadID', 'Phone', 'Direction', 'Text', 'Timestamp'];

/* ---------------------------- Sheet helpers ---------------------------- */

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sheetToObjects_(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows
    .filter(function (r) { return r.join('') !== ''; })
    .map(function (r) {
      const obj = {};
      headers.forEach(function (h, i) { obj[h] = r[i]; });
      return obj;
    });
}

function findRowIndexById_(sheet, idColName, id) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const col = headers.indexOf(idColName);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][col]) === String(id)) return i + 1; // 1-based row number
  }
  return -1;
}

function findLeadByPhone_(phone) {
  const sheet = getSheet_(LEADS_SHEET, LEAD_HEADERS);
  const leads = sheetToObjects_(sheet);
  return leads.find(function (l) { return String(l.Phone) === String(phone); });
}

function getOrCreateLeadByPhone_(phone, name, source) {
  const existing = findLeadByPhone_(phone);
  if (existing) return existing;

  const sheet = getSheet_(LEADS_SHEET, LEAD_HEADERS);
  const id = 'L-' + new Date().getTime();
  const now = new Date();
  const row = [id, name || phone, phone, 'New', source || 'WhatsApp', '', now, now];
  sheet.appendRow(row);
  const obj = {};
  LEAD_HEADERS.forEach(function (h, i) { obj[h] = row[i]; });
  return obj;
}

function touchLeadLastMessage_(leadId) {
  const sheet = getSheet_(LEADS_SHEET, LEAD_HEADERS);
  const rowNum = findRowIndexById_(sheet, 'LeadID', leadId);
  if (rowNum === -1) return;
  const col = LEAD_HEADERS.indexOf('LastMessageAt') + 1;
  sheet.getRange(rowNum, col).setValue(new Date());
}

function appendMessage_(leadId, phone, direction, text) {
  const sheet = getSheet_(MESSAGES_SHEET, MESSAGE_HEADERS);
  const id = 'M-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
  sheet.appendRow([id, leadId, phone, direction, text, new Date()]);
  touchLeadLastMessage_(leadId);
}

/* ------------------------------- Web app -------------------------------- */

function doGet(e) {
  const params = e.parameter;

  // WhatsApp webhook verification handshake
  if (params['hub.mode'] === 'subscribe') {
    const props = PropertiesService.getScriptProperties();
    const verifyToken = props.getProperty('VERIFY_TOKEN');
    if (params['hub.verify_token'] === verifyToken) {
      return ContentService.createTextOutput(params['hub.challenge']);
    }
    return ContentService.createTextOutput('Verification failed').setMimeType(ContentService.MimeType.TEXT);
  }

  // Front-end data requests
  if (params.action === 'getData') {
    const leadsSheet = getSheet_(LEADS_SHEET, LEAD_HEADERS);
    const messagesSheet = getSheet_(MESSAGES_SHEET, MESSAGE_HEADERS);
    const payload = {
      leads: sheetToObjects_(leadsSheet),
      messages: sheetToObjects_(messagesSheet)
    };
    return jsonOutput_(payload);
  }

  return ContentService.createTextOutput('WhatsApp CRM backend is running.');
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);

  // Incoming WhatsApp Cloud API webhook payload
  if (body.object === 'whatsapp_business_account') {
    handleWhatsAppWebhook_(body);
    return jsonOutput_({ status: 'ok' });
  }

  // Front-end API actions
  switch (body.action) {
    case 'addLead':
      return jsonOutput_(apiAddLead_(body));
    case 'updateLead':
      return jsonOutput_(apiUpdateLead_(body));
    case 'sendMessage':
      return jsonOutput_(apiSendMessage_(body));
    default:
      return jsonOutput_({ error: 'Unknown action' });
  }
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------- WhatsApp webhook logic ------------------------ */

function handleWhatsAppWebhook_(body) {
  try {
    const entry = body.entry && body.entry[0];
    const change = entry && entry.changes && entry.changes[0];
    const value = change && change.value;
    if (!value || !value.messages) return; // e.g. a status update, not a message

    const message = value.messages[0];
    const contact = value.contacts && value.contacts[0];
    const phone = message.from;
    const name = contact && contact.profile && contact.profile.name;
    const text = message.text ? message.text.body : ('[' + message.type + ']');

    const lead = getOrCreateLeadByPhone_(phone, name, 'WhatsApp');
    appendMessage_(lead.LeadID, phone, 'in', text);
  } catch (err) {
    // Swallow errors so WhatsApp doesn't keep retrying a malformed payload
    console.error('Webhook error: ' + err);
  }
}

/* ------------------------------ API actions ------------------------------ */

function apiAddLead_(body) {
  const sheet = getSheet_(LEADS_SHEET, LEAD_HEADERS);
  const id = 'L-' + new Date().getTime();
  const now = new Date();
  const row = [
    id,
    body.name || '',
    body.phone || '',
    body.status || 'New',
    body.source || 'Manual',
    body.notes || '',
    now,
    now
  ];
  sheet.appendRow(row);
  return { status: 'ok', leadId: id };
}

function apiUpdateLead_(body) {
  const sheet = getSheet_(LEADS_SHEET, LEAD_HEADERS);
  const rowNum = findRowIndexById_(sheet, 'LeadID', body.leadId);
  if (rowNum === -1) return { error: 'Lead not found' };

  ['Name', 'Phone', 'Status', 'Source', 'Notes'].forEach(function (field) {
    if (body[field] !== undefined) {
      const col = LEAD_HEADERS.indexOf(field) + 1;
      sheet.getRange(rowNum, col).setValue(body[field]);
    }
  });
  return { status: 'ok' };
}

function apiSendMessage_(body) {
  const props = PropertiesService.getScriptProperties();
  const accessToken = props.getProperty('ACCESS_TOKEN');
  const phoneNumberId = props.getProperty('PHONE_NUMBER_ID');

  if (!accessToken || !phoneNumberId) {
    return { error: 'ACCESS_TOKEN or PHONE_NUMBER_ID not configured in Script Properties' };
  }

  const url = 'https://graph.facebook.com/v20.0/' + phoneNumberId + '/messages';
  const payload = {
    messaging_product: 'whatsapp',
    to: body.phone,
    type: 'text',
    text: { body: body.text }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + accessToken },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());

  if (result.error) {
    return { error: result.error.message };
  }

  appendMessage_(body.leadId, body.phone, 'out', body.text);
  return { status: 'ok' };
}
