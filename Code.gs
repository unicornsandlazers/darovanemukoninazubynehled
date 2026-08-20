/**
 * Backend pro Rodinný průzkum dárků.
 *
 * Očekávaná struktura Google Sheetu (3 listy):
 * - "Respondents": sloupec A = jméno respondenta (řádek 1 = hlavička)
 * - "Gifts":       sloupec A = název dárku, B = jazyk originálu (cs/sk/fr;
 *                  prázdné/neplatné se bere jako cs) — řádek 1 = hlavička
 * - "Responses":   A = časová značka, B = jméno, C = dárek,
 *                  D = kategorie (odvozená ze skóre), E = skóre (-10..10),
 *                  F = komentář
 *
 * Vícejazyčnost: jména se nepřekládají. Název dárku se v listech ukládá
 * a používá jako klíč (pro hlasování, "už odhlasováno" apod.) vždy
 * v původním jazyce, v jakém ho kdo napsal — to je "gift". Pro zobrazení
 * uživateli se navíc počítá "giftDisplay", přeložený za běhu přes
 * LanguageApp do jazyka podle parametru "lang" (cs/sk/fr, výchozí cs),
 * s cachováním přes CacheService (6 hodin), ať appka zbytečně
 * nevytěžuje kvótu překladače a je rychlá.
 *
 * Zdrojový jazyk dárku (sloupec B v Gifts) appka posílá do LanguageApp
 * explicitně místo automatické detekce — u krátkých/nejednoznačných
 * názvů uměla automatická detekce špatně tipnout jazyk a vyrobit tak
 * z překladu úplně jiné slovo. Když je cílový jazyk stejný jako
 * originál, appka překlad rovnou přeskočí (vrátí originál beze změny).
 *
 * doGet akce: respondents, gifts, uservotes, myresponses, giftstats,
 *             highlights (všechny kromě uservotes/respondents přijímají
 *             ?lang=cs|sk|fr)
 * doPost typy: start, addgift, (bez type = uložení hlasu)
 *
 * Po každé úpravě tohoto souboru je potřeba v Apps Scriptu udělat
 * Deploy > Manage deployments > (tužka) Edit > New version > Deploy,
 * jinak se změny na živé URL neprojeví. Web app musí být nasazený
 * s "Execute as: Me" a "Who has access: Anyone".
 */

const SUPPORTED_LANGS = ["cs", "sk", "fr"];

function doGet(e) {
  const action = e.parameter.action;
  const lang = normalizeLang_(e.parameter.lang);

  try {
    if (action === "respondents") {
      return json(getColumnValues_("Respondents", 1));
    }

    if (action === "gifts") {
      return json(getGiftsWithDisplay_(lang));
    }

    if (action === "uservotes") {
      const name = (e.parameter.name || "").trim().toLowerCase();
      return json(getUserVotes_(name));
    }

    if (action === "myresponses") {
      const name = (e.parameter.name || "").trim().toLowerCase();
      return json(getUserResponses_(name, lang));
    }

    if (action === "giftstats") {
      return json(getGiftStats_(lang));
    }

    if (action === "highlights") {
      return json(getHighlights_(lang));
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

    if (data.type === "addgift") {
      if (!data.gift || !data.gift.trim()) {
        return json({ error: "Chybí název dárku." });
      }
      // Jazyk dárku odvozujeme z jazyka appky, ve kterém ho člověk zrovna
      // psal — to je spolehlivější odhad než automatická detekce.
      addGiftIfMissing_(data.gift.trim(), normalizeLang_(data.lang));
      return json({ success: true });
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
    // přidání duplicitního řádku. "data.gift" je vždy kanonický (nepřeložený)
    // název, appka nikdy neposílá přeloženou verzi zpátky.
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

function normalizeLang_(lang) {
  const l = String(lang || "").trim().toLowerCase();
  return SUPPORTED_LANGS.indexOf(l) >= 0 ? l : "cs";
}

// Mapa dárek → jazyk originálu, podle sloupce B v listu Gifts. Chybějící
// nebo neplatná hodnota se bere jako "cs" (appka byla původně jen česká).
function getGiftLanguageMap_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Gifts");
  if (!sheet) return {};

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};

  const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const map = {};

  values.forEach(row => {
    const gift = String(row[0]).trim();
    if (!gift) return;
    map[gift] = normalizeLang_(row[1]);
  });

  return map;
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

function getUserResponses_(nameLower, lang) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  // B = jméno, C = dárek, D = kategorie, E = skóre, F = komentář
  const values = sheet.getRange(2, 2, lastRow - 1, 5).getValues();
  const langMap = getGiftLanguageMap_();

  return values
    .filter(row => String(row[0]).trim().toLowerCase() === nameLower)
    .map(row => {
      const gift = String(row[1]).trim();
      return {
        gift: gift,
        // U dárků mimo seznam Gifts (např. přidaných přes "další nápad"
        // na konci dotazníku) jazyk originálu neznáme — tam se použije
        // záložní automatická detekce v translateText_.
        giftDisplay: translateText_(gift, langMap[gift], lang),
        score: Number(row[3]),
        comment: String(row[4] || "").trim()
      };
    });
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

function addGiftIfMissing_(gift, giftLang) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Gifts");
  if (!sheet) return;

  const existing = getColumnValues_("Gifts", 1);
  const giftLower = gift.toLowerCase();
  const exists = existing.some(g => g.toLowerCase() === giftLower);

  if (!exists) {
    sheet.appendRow([gift, giftLang]);
  }
}

function getGiftsWithDisplay_(lang) {
  const langMap = getGiftLanguageMap_();
  return getColumnValues_("Gifts", 1).map(gift => ({
    gift: gift,
    giftDisplay: translateText_(gift, langMap[gift], lang)
  }));
}

// Průměrné skóre a počet hlasů pro každý dárek ze seznamu Gifts, seřazené
// od nejoblíbenějšího po nejméně oblíbený. Dárky bez hlasů (avgScore null)
// jsou vždy až za těmi s hlasy, seřazené abecedně (podle kanonického
// názvu — u přeložených verzí by řazení mezi jazyky nesedělo).
function getGiftStats_(lang) {
  const gifts = getColumnValues_("Gifts", 1);
  const langMap = getGiftLanguageMap_();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");

  const sums = {};
  const counts = {};

  if (sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      // C = dárek, D = kategorie, E = skóre
      const values = sheet.getRange(2, 3, lastRow - 1, 3).getValues();

      values.forEach(row => {
        const gift = String(row[0]).trim();
        const score = Number(row[2]);

        if (!gift || isNaN(score)) return;

        sums[gift] = (sums[gift] || 0) + score;
        counts[gift] = (counts[gift] || 0) + 1;
      });
    }
  }

  const withVotes = [];
  const withoutVotes = [];

  gifts.forEach(gift => {
    const count = counts[gift] || 0;
    const item = {
      gift: gift,
      giftDisplay: translateText_(gift, langMap[gift], lang),
      avgScore: count > 0 ? sums[gift] / count : null,
      voteCount: count
    };

    if (count > 0) {
      withVotes.push(item);
    } else {
      withoutVotes.push(item);
    }
  });

  withVotes.sort((a, b) => b.avgScore - a.avgScore);
  withoutVotes.sort((a, b) => a.gift.localeCompare(b.gift, "cs"));

  return withVotes.concat(withoutVotes);
}

// Top 5 nejoblíbenějších, nejméně oblíbených a nejkontroverznějších
// dárků (nejvyšší rozptyl hodnocení = rodina se na nich nejvíc neshodla).
// Kontroverzní počítáme jen z dárků aspoň se 2 hlasy, jinak rozptyl
// nemá smysl.
function getHighlights_(lang) {
  const gifts = getColumnValues_("Gifts", 1);
  const langMap = getGiftLanguageMap_();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Responses");

  const scoresByGift = {};

  if (sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      // C = dárek, D = kategorie, E = skóre
      const values = sheet.getRange(2, 3, lastRow - 1, 3).getValues();

      values.forEach(row => {
        const gift = String(row[0]).trim();
        const score = Number(row[2]);

        if (!gift || isNaN(score)) return;
        if (!scoresByGift[gift]) scoresByGift[gift] = [];
        scoresByGift[gift].push(score);
      });
    }
  }

  const stats = gifts
    .map(gift => {
      const scores = scoresByGift[gift];
      if (!scores || scores.length === 0) return null;

      const sum = scores.reduce((a, b) => a + b, 0);
      const avg = sum / scores.length;
      const variance = scores.reduce((acc, s) => acc + Math.pow(s - avg, 2), 0) / scores.length;

      return {
        gift: gift,
        giftDisplay: translateText_(gift, langMap[gift], lang),
        avgScore: avg,
        voteCount: scores.length,
        min: Math.min.apply(null, scores),
        max: Math.max.apply(null, scores),
        stdev: Math.sqrt(variance),
        // Rozložení hlasů na škále -10..10, jen hodnoty s aspoň 1 hlasem
        // (pro vizualizaci rozmístění hodnocení na obrazovce Zajímavosti).
        histogram: buildHistogram_(scores)
      };
    })
    .filter(item => item !== null);

  // Vážený průměr (stejný princip jako např. IMDb žebříček): dárek s málo
  // hlasy se přitáhne blíž k celkovému průměru přes všechny dárky, takže
  // ho pár nadšených/naštvaných hlasů nevystřelí před dárek, který
  // spolehlivě potvrdilo hodně lidí. "confidence" je průměrný počet
  // hlasů na dárek — čím víc hlasů dárek má oproti tomuhle průměru, tím
  // víc se počítá jeho vlastní skóre a míň se přitahuje ke globálu.
  const totalVotes = stats.reduce((sum, item) => sum + item.voteCount, 0);
  const totalScoreSum = stats.reduce((sum, item) => sum + item.avgScore * item.voteCount, 0);
  const globalAvg = totalVotes > 0 ? totalScoreSum / totalVotes : 0;
  const confidence = stats.length > 0 ? totalVotes / stats.length : 0;

  stats.forEach(item => {
    item.weightedScore =
      (item.voteCount / (item.voteCount + confidence)) * item.avgScore +
      (confidence / (item.voteCount + confidence)) * globalAvg;

    // Kontroverznost = rozptyl hodnocení × váha podle počtu hlasů (odmocnina,
    // ať to neroste přehnaně prudce) — rozpor potvrzený víc lidmi váží víc
    // než stejně velký rozpor jen mezi dvěma hlasujícími.
    item.controversyScore = item.stdev * Math.sqrt(item.voteCount);
  });

  const topFavorite = stats.slice().sort((a, b) => b.weightedScore - a.weightedScore).slice(0, 5);
  const topUnpopular = stats.slice().sort((a, b) => a.weightedScore - b.weightedScore).slice(0, 5);

  const topControversial = stats
    .filter(item => item.voteCount >= 2)
    .sort((a, b) => b.controversyScore - a.controversyScore)
    .slice(0, 5);

  return {
    topFavorite: topFavorite,
    topUnpopular: topUnpopular,
    topControversial: topControversial
  };
}

function buildHistogram_(scores) {
  const counts = {};
  scores.forEach(s => { counts[s] = (counts[s] || 0) + 1; });

  return Object.keys(counts).map(k => ({
    score: Number(k),
    count: counts[k]
  }));
}

// Přeloží text na požadovaný jazyk přes vestavěnou LanguageApp (Google
// Translate, zdarma v rámci Apps Scriptu, bez API klíče). "sourceLang" by
// měl být znám (ze sloupce Language v Gifts) — s explicitním zdrojovým
// jazykem je překlad mnohem spolehlivější než s automatickou detekcí,
// která u krátkých/nejednoznačných slov uměla uhodnout úplně jiný jazyk
// a vyrobit z toho nesmyslný překlad. Pokud zdrojový jazyk neznáme (např.
// u dárku přidaného mimo formulář "Přidat dárek"), použije se jako
// záloha automatická detekce. Když je cílový jazyk stejný jako zdrojový,
// překlad se rovnou přeskočí. Výsledek se cachuje na 6 hodin (maximum
// CacheService), ať se stejný text nepřekládá opakovaně.
function translateText_(text, sourceLang, targetLang) {
  if (!text) return text;
  if (sourceLang && sourceLang === targetLang) return text;

  const cache = CacheService.getScriptCache();
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    text + "|" + (sourceLang || "") + "|" + targetLang
  );
  const cacheKey = "tr_" + Utilities.base64EncodeWebSafe(digest);

  const cached = cache.get(cacheKey);
  if (cached !== null) return cached;

  let translated;
  try {
    translated = LanguageApp.translate(text, sourceLang || "", targetLang);
  } catch (err) {
    translated = text; // Když se překlad nepovede, ukážeme radši původní text než chybu.
  }

  cache.put(cacheKey, translated, 21600);
  return translated;
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
