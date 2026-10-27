/**
 * createdbyjc — Roadmap leads → Google Sheet
 *
 * SETUP (about 5 minutes, one time):
 *  1. Go to https://sheets.new and name the sheet "createdbyjc Leads".
 *  2. Menu: Extensions → Apps Script. Delete the sample code and paste this whole file. Click Save.
 *  3. Click Deploy → New deployment → gear icon → "Web app".
 *       Description:   Roadmap leads
 *       Execute as:    Me
 *       Who has access: Anyone
 *     Click Deploy, approve the Google permission prompt (it only touches this sheet).
 *  4. Copy the "Web app URL" (ends in /exec) and paste it into assets/config.js as leadEndpoint.
 *  5. Test: submit the form on the live site once. A "Leads" tab appears with your test row.
 *
 * If you edit this script later: Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy.
 * The URL stays the same.
 */

var SHEET_NAME = "Leads";
var HEADERS = ["Date", "First name", "Email", "Repeat sign-up?", "Source", "Page"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var firstName = clean_(data.firstName, 60);
    var email = clean_(data.email, 120).toLowerCase();

    if (firstName.length < 2) return json_({ ok: false, error: "first_name" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ ok: false, error: "email" });

    var sheet = getSheet_();
    var repeat = false;
    var last = sheet.getLastRow();
    if (last > 1) {
      var emails = sheet.getRange(2, 3, last - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).toLowerCase() === email) { repeat = true; break; }
      }
    }

    sheet.appendRow([
      new Date(),
      firstName,
      email,
      repeat ? "Yes" : "",
      clean_(data.source, 80),
      clean_(data.page, 300)
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "server" });
  } finally {
    lock.releaseLock();
  }
}

/* Visiting the URL in a browser shows this, so you can confirm the deployment is live. */
function doGet() {
  return json_({ ok: true, message: "createdbyjc lead endpoint is live" });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm");
  }
  return sheet;
}

/* Trims, caps length, and stops text that starts with = + - @ from running as a spreadsheet formula. */
function clean_(value, max) {
  var s = String(value == null ? "" : value).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
