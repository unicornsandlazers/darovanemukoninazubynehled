/**
 * Backend pro Rodinný průzkum dárků.
 *
 * Očekávaná struktura Google Sheetu (3 listy):
 * - "Respondents": sloupec A = jméno respondenta (řádek 1 = hlavička)
 * - "Gifts":       sloupec A = název dárku (řádek 1 = hlavička)
 * - "Responses":   A = časová značka, B = jméno, C = dárek,
 *                  D = kategorie (odvozená ze skóre), E = skóre (-10..10),
 *                  F = komentář
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
      const name = data.name.trim();
      addRespondentIfMissing_(name);
      // Rovnou vrátíme i seznam dárků, které tenhle člověk už ohodnotil,
      // ať appka nemusí posílat samostatný požadavek navíc.
      return json({ success: true, alreadyVoted: getUserVotes_(name.toLowerCase()) });
    }

    if (!data.name || !data.gift || typeof data.score !== "number" || isNaN(data.score)) {
      return json({ error: "Chybí jméno, dárek nebo hodnocení." });
    }

    const name = data.name.trim();
    addRespondentIfMissing_(name);

    const score = clampScore_(data.score);
    const category = categoryFromScore_(score);
    const comment = (data.comment || "").toString().trim();
    const row = [new Date(), name, data.gift, category, score, comment];

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");

    // Pokud už pro tuhle dvojici jméno+dárek řádek existuje (např. člověk
    // se vrátil tlačítkem "Zpět" a opravil hodnocení), přepíšeme ho místo
    // přidání duplicitního řádku.
    const existingRow = findResponseRow_(sheet, name.toLowerCase(), data.gift);

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return json({ success: true });
  } catch (err) {
    return json({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function clampScore_(score) {
  const rounded = Math.round(score);
  return Math.max(-10, Math.min(10, rounded));
}

function categoryFromScore_(score) {
  if (score > 0) return "Oblíbené";
  if (score < 0) return "Nevhodné";
  return "Nemám názor";
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

function findResponseRow_(sheet, nameLower, gift) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  // B = jméno, C = dárek
  const values = sheet.getRange(2, 2, lastRow - 1, 2).getValues();

  for (let i = 0; i < values.length; i++) {
    const rowName = String(values[i][0]).trim().toLowerCase();
    const rowGift = String(values[i][1]).trim();

    if (rowName === nameLower && rowGift === gift) {
      return i + 2; // skutečné číslo řádku v listu (řádek 1 je hlavička)
    }
  }

  return -1;
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
