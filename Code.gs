/**
 * Backend pro Rodinný průzkum dárků.
 *
 * Očekávaná struktura Google Sheetu (3 listy):
 * - "Respondents": sloupec A = jméno respondenta (řádek 1 = hlavička)
 * - "Gifts":       sloupec A = název dárku (řádek 1 = hlavička)
 * - "Responses":   A = časová značka, B = jméno, C = dárek, D = kategorie
 *
 * Po každé úpravě tohoto souboru je potřeba v Apps Scriptu udělat
 * Deploy > Manage deployments > (tužka) Edit > New version > Deploy,
 * jinak se změny na živé URL neprojeví. Web app musí být nasazený
 * s "Execute as: Me" a "Who has access: Anyone".
 */

function doGet(e) {
  const action = e.parameter.action;

  try {
    if (action === "respondents") {
      return json(getColumnValues_("Respondents", 1));
    }

    if (action === "gifts") {
      return json(getColumnValues_("Gifts", 1));
    }

    if (action === "uservotes") {
      const name = (e.parameter.name || "").trim().toLowerCase();
      return json(getUserVotes_(name));
    }

    return json({ error: "Unknown action" });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);

    if (data.type === "start") {
      if (!data.name) {
        return json({ error: "Chybí jméno." });
      }
      addRespondentIfMissing_(data.name.trim());
      return json({ success: true });
    }

    if (!data.name || !data.gift || !data.category) {
      return json({ error: "Chybí jméno, dárek nebo kategorie." });
    }

    addRespondentIfMissing_(data.name.trim());

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");
    sheet.appendRow([new Date(), data.name.trim(), data.gift, data.category]);

    return json({ success: true });
  } catch (err) {
    return json({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getColumnValues_(sheetName, col) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet.getRange(2, col, lastRow - 1, 1)
    .getValues()
    .flat()
    .map(v => String(v).trim())
    .filter(v => v !== "");
}

function getUserVotes_(nameLower) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  // B = jméno, C = dárek
  const values = sheet.getRange(2, 2, lastRow - 1, 2).getValues();

  return values
    .filter(row => String(row[0]).trim().toLowerCase() === nameLower)
    .map(row => String(row[1]).trim());
}

function addRespondentIfMissing_(name) {
  if (!name) return;

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respondents");
  if (!sheet) return;

  const existing = getColumnValues_("Respondents", 1);
  const nameLower = name.toLowerCase();
  const exists = existing.some(n => n.toLowerCase() === nameLower);

  if (!exists) {
    sheet.appendRow([name]);
  }
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
