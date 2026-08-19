const API =
"https://script.google.com/macros/s/AKfycbwSZVAII3Mk3i6H16w40aJwebHam6-RXSKDHKnas2fh0XUtuERMCu1_soiEGM8UdP4i/exec";

/**
 * Jména respondentů se nikdy nepřekládají. U dárků appka rozlišuje
 * "gift" (kanonický, nepřeložený název — používá se jako klíč při
 * hlasování a párování odpovědí) a "giftDisplay" (přeložený text pro
 * zobrazení, počítá ho backend přes Code.gs podle zvoleného jazyka).
 * Objekty s dárky (v allGifts, queue, reviewData…) mají vždy oba tyhle
 * dva atributy.
 */
const I18N = {
    cs: {
        home: "← Domů",
        app_title: "Rodinný průzkum dárků",
        name_label: "Jak se jmenuješ?",
        name_placeholder: "Začni psát jméno",
        start_button: "Hodnotit dárky",
        loading: "Načítám…",
        overview_button: "📊 Přehled dárků",
        highlights_button: "🏆 Zajímavosti",
        addgift_button: "➕ Přidat dárek",
        name_required: "Vyplň prosím jméno.",
        confirm_new_name: 'Jméno "{name}" jsme zatím v seznamu nenašli. Chceš pokračovat jako nový respondent?',
        check_name: "Zkontroluj prosím jméno, nebo ho vyber ze seznamu.",
        all_done: "Zatím jsi ohodnotil/a všechny dárky ze seznamu. Díky! 🎉",
        load_start_error: "Něco se pokazilo při načítání. Zkus to prosím znovu.",
        slider_bad: "Nevhodné",
        slider_neutral: "Nemám názor",
        slider_good: "Ideální",
        vote_hint: "Posun posuvníku odešle hodnocení a posune tě na další dárek.",
        comment_placeholder: "Komentář (nepovinné) — Enter odešle, Shift+Enter nový řádek",
        back_button: "⬅ Zpět",
        cancel_edit_button: "Zrušit úpravu",
        vote_recorded: "✓ Zaznamenáno: {score}",
        finish_title_default: "Hotovo 🎉",
        overview_title: "Přehled dárků",
        person_select_label: "Odpovědi konkrétního člena rodiny",
        person_select_default: "— Vyber jméno —",
        overview_hint: "Pořadí podle průměrného hodnocení všech hlasujících.",
        overview_empty: "Zatím tu nejsou žádné dárky.",
        overview_load_error: "Nepodařilo se načíst přehled. Zkus to prosím znovu.",
        review_back_link: "‹ Zpět na přehled dárků",
        responses_for: "Odpovědi: {name}",
        review_empty: "Zatím tu nejsou žádné vyplněné odpovědi.",
        review_load_error: "Nepodařilo se načíst odpovědi. Zkus to prosím znovu.",
        edit_button: "✏️ Upravit",
        editing_progress: "Úprava odpovědi",
        highlights_title: "Zajímavosti",
        top_favorite_heading: "🏆 Nejoblíbenější",
        top_unpopular_heading: "💔 Nejméně oblíbené",
        top_controversial_heading: "⚡ Nejkontroverznější",
        controversial_hint: "Dárky, na kterých se rodina nejvíc neshodla.",
        highlights_not_enough: "Zatím není dost hlasů.",
        highlights_load_error: "Nepodařilo se načíst.",
        range_label: "hodnocení od {min} do {max}",
        addgift_title: "Přidat dárek",
        addgift_hint: "Nový nápad se přidá do seznamu, příští hlasující ho uvidí.",
        gift_name_placeholder: "Název dárku",
        addgift_submit: "Přidat do seznamu",
        gift_name_required: "Napiš prosím název dárku.",
        addgift_success: 'Přidáno: "{gift}" ✅ Uvidí ho příští hlasující.',
        addgift_error: "Nepodařilo se přidat, zkus to prosím znovu.",
        finish_back_button: "⬅ Opravit poslední hodnocení",
        finish_prompt: "Napadá tě ještě další dárek, který jsme v seznamu neměli?",
        extra_add_button: "Přidat",
        extra_added: 'Přidáno: "{gift}" ✅',
        save_error_prefix: "⚠️ {count} odpověď(i) se nepodařilo uložit.",
        retry_button: "Zkusit znovu",
        saving: "Ukládám…",
        votes_none: "zatím bez hlasů",
        vote_one: "hlas",
        vote_few: "hlasy",
        vote_many: "hlasů"
    },
    sk: {
        home: "← Domov",
        app_title: "Rodinný prieskum darčekov",
        name_label: "Ako sa voláš?",
        name_placeholder: "Začni písať meno",
        start_button: "Hodnotiť darčeky",
        loading: "Načítavam…",
        overview_button: "📊 Prehľad darčekov",
        highlights_button: "🏆 Zaujímavosti",
        addgift_button: "➕ Pridať darček",
        name_required: "Vyplň prosím meno.",
        confirm_new_name: 'Meno "{name}" sme zatiaľ v zozname nenašli. Chceš pokračovať ako nový respondent?',
        check_name: "Skontroluj prosím meno, alebo ho vyber zo zoznamu.",
        all_done: "Zatiaľ si ohodnotil/a všetky darčeky zo zoznamu. Ďakujeme! 🎉",
        load_start_error: "Niečo sa pokazilo pri načítaní. Skús to prosím znovu.",
        slider_bad: "Nevhodné",
        slider_neutral: "Nemám názor",
        slider_good: "Ideálne",
        vote_hint: "Posun posuvníka odošle hodnotenie a posunie ťa na ďalší darček.",
        comment_placeholder: "Komentár (nepovinné) — Enter odošle, Shift+Enter nový riadok",
        back_button: "⬅ Späť",
        cancel_edit_button: "Zrušiť úpravu",
        vote_recorded: "✓ Zaznamenané: {score}",
        finish_title_default: "Hotovo 🎉",
        overview_title: "Prehľad darčekov",
        person_select_label: "Odpovede konkrétneho člena rodiny",
        person_select_default: "— Vyber meno —",
        overview_hint: "Poradie podľa priemerného hodnotenia všetkých hlasujúcich.",
        overview_empty: "Zatiaľ tu nie sú žiadne darčeky.",
        overview_load_error: "Nepodarilo sa načítať prehľad. Skús to prosím znovu.",
        review_back_link: "‹ Späť na prehľad darčekov",
        responses_for: "Odpovede: {name}",
        review_empty: "Zatiaľ tu nie sú žiadne vyplnené odpovede.",
        review_load_error: "Nepodarilo sa načítať odpovede. Skús to prosím znovu.",
        edit_button: "✏️ Upraviť",
        editing_progress: "Úprava odpovede",
        highlights_title: "Zaujímavosti",
        top_favorite_heading: "🏆 Najobľúbenejšie",
        top_unpopular_heading: "💔 Najmenej obľúbené",
        top_controversial_heading: "⚡ Najkontroverznejšie",
        controversial_hint: "Darčeky, na ktorých sa rodina najviac nezhodla.",
        highlights_not_enough: "Zatiaľ nie je dosť hlasov.",
        highlights_load_error: "Nepodarilo sa načítať.",
        range_label: "hodnotenie od {min} do {max}",
        addgift_title: "Pridať darček",
        addgift_hint: "Nový nápad sa pridá do zoznamu, ďalší hlasujúci ho uvidí.",
        gift_name_placeholder: "Názov darčeka",
        addgift_submit: "Pridať do zoznamu",
        gift_name_required: "Napíš prosím názov darčeka.",
        addgift_success: 'Pridané: "{gift}" ✅ Uvidí ho ďalší hlasujúci.',
        addgift_error: "Nepodarilo sa pridať, skús to prosím znovu.",
        finish_back_button: "⬅ Opraviť posledné hodnotenie",
        finish_prompt: "Napadá ťa ešte ďalší darček, ktorý sme v zozname nemali?",
        extra_add_button: "Pridať",
        extra_added: 'Pridané: "{gift}" ✅',
        save_error_prefix: "⚠️ {count} odpoveď(e) sa nepodarilo uložiť.",
        retry_button: "Skúsiť znovu",
        saving: "Ukladám…",
        votes_none: "zatiaľ bez hlasov",
        vote_one: "hlas",
        vote_few: "hlasy",
        vote_many: "hlasov"
    },
    fr: {
        home: "← Accueil",
        app_title: "Sondage familial sur les cadeaux",
        name_label: "Comment tu t'appelles ?",
        name_placeholder: "Commence à taper ton prénom",
        start_button: "Évaluer les cadeaux",
        loading: "Chargement…",
        overview_button: "📊 Aperçu des cadeaux",
        highlights_button: "🏆 Points forts",
        addgift_button: "➕ Ajouter un cadeau",
        name_required: "Indique ton prénom, s'il te plaît.",
        confirm_new_name: 'On n\'a pas trouvé "{name}" dans la liste. Tu veux continuer en tant que nouveau participant ?',
        check_name: "Vérifie ton prénom ou choisis-le dans la liste.",
        all_done: "Tu as déjà évalué tous les cadeaux de la liste. Merci ! 🎉",
        load_start_error: "Un problème est survenu pendant le chargement. Réessaie, s'il te plaît.",
        slider_bad: "Inapproprié",
        slider_neutral: "Sans avis",
        slider_good: "Idéal",
        vote_hint: "Déplacer le curseur envoie ta note et passe au cadeau suivant.",
        comment_placeholder: "Commentaire (facultatif) — Entrée envoie, Maj+Entrée nouvelle ligne",
        back_button: "⬅ Retour",
        cancel_edit_button: "Annuler la modification",
        vote_recorded: "✓ Enregistré : {score}",
        finish_title_default: "Terminé 🎉",
        overview_title: "Aperçu des cadeaux",
        person_select_label: "Réponses d'un membre de la famille",
        person_select_default: "— Choisis un prénom —",
        overview_hint: "Classement selon la note moyenne de tous les votants.",
        overview_empty: "Il n'y a pas encore de cadeaux.",
        overview_load_error: "Impossible de charger l'aperçu. Réessaie, s'il te plaît.",
        review_back_link: "‹ Retour à l'aperçu des cadeaux",
        responses_for: "Réponses : {name}",
        review_empty: "Il n'y a pas encore de réponses.",
        review_load_error: "Impossible de charger les réponses. Réessaie, s'il te plaît.",
        edit_button: "✏️ Modifier",
        editing_progress: "Modification de la réponse",
        highlights_title: "Points forts",
        top_favorite_heading: "🏆 Les plus appréciés",
        top_unpopular_heading: "💔 Les moins appréciés",
        top_controversial_heading: "⚡ Les plus controversés",
        controversial_hint: "Les cadeaux qui divisent le plus la famille.",
        highlights_not_enough: "Pas encore assez de votes.",
        highlights_load_error: "Le chargement a échoué.",
        range_label: "note de {min} à {max}",
        addgift_title: "Ajouter un cadeau",
        addgift_hint: "La nouvelle idée sera ajoutée à la liste, le prochain votant la verra.",
        gift_name_placeholder: "Nom du cadeau",
        addgift_submit: "Ajouter à la liste",
        gift_name_required: "Indique le nom du cadeau, s'il te plaît.",
        addgift_success: 'Ajouté : « {gift} » ✅ Le prochain votant le verra.',
        addgift_error: "Impossible d'ajouter, réessaie, s'il te plaît.",
        finish_back_button: "⬅ Corriger la dernière note",
        finish_prompt: "Tu penses à un autre cadeau qui n'était pas dans la liste ?",
        extra_add_button: "Ajouter",
        extra_added: 'Ajouté : « {gift} » ✅',
        save_error_prefix: "⚠️ {count} réponse(s) non enregistrée(s).",
        retry_button: "Réessayer",
        saving: "Enregistrement…",
        votes_none: "pas encore de vote",
        vote_one: "vote",
        vote_few: "votes",
        vote_many: "votes"
    }
};

function detectLang() {
    const nav = (navigator.language || "cs").toLowerCase();
    if (nav.indexOf("sk") === 0) return "sk";
    if (nav.indexOf("fr") === 0) return "fr";
    return "cs";
}

let lang = localStorage.getItem("giftSurveyLang") || detectLang();

function t(key, vars) {
    const dict = I18N[lang] || I18N.cs;
    let str = dict[key] !== undefined ? dict[key] : (I18N.cs[key] !== undefined ? I18N.cs[key] : key);

    if (vars) {
        Object.keys(vars).forEach(k => {
            str = str.split(`{${k}}`).join(String(vars[k]));
        });
    }

    return str;
}

function localeForLang(l) {
    if (l === "sk") return "sk-SK";
    if (l === "fr") return "fr-FR";
    return "cs-CZ";
}

function formatScore(score) {
    const sign = score > 0 ? "+" : "";
    return sign + score.toLocaleString(localeForLang(lang), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        el.textContent = t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });

    document.documentElement.lang = lang;
}

function updateLangButtons() {
    document.querySelectorAll(".langBtn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
}

function setLang(newLang) {
    if (lang === newLang) return;

    lang = newLang;
    localStorage.setItem("giftSurveyLang", lang);

    applyStaticTranslations();
    updateLangButtons();
    refreshDynamicScreen();
}

// Po přepnutí jazyka je potřeba přenačíst přeložené názvy dárků
// v aktuálně otevřené obrazovce (statické popisky se přepnou samy
// přes applyStaticTranslations, ale názvy dárků se překládají na
// backendu, takže je nutné je znovu natáhnout).
async function refreshDynamicScreen() {
    const newGifts = await loadGifts();
    remapQueueDisplays(newGifts);

    if (document.getElementById("overviewScreen").style.display !== "none") {
        showOverview();
    } else if (document.getElementById("highlightsScreen").style.display !== "none") {
        showHighlights();
    } else if (document.getElementById("reviewScreen").style.display !== "none" && currentUser) {
        loadReviewFor(currentUser);
    }
}

function remapQueueDisplays(newGifts) {
    const displayByGift = {};
    newGifts.forEach(g => { displayByGift[g.gift] = g.giftDisplay; });

    queue = queue.map(item => ({
        gift: item.gift,
        giftDisplay: displayByGift[item.gift] || item.giftDisplay
    }));

    const surveyVisible = document.getElementById("surveyScreen").style.display !== "none";
    if (surveyVisible && editingIndex === null && queue.length > 0) {
        showGift();
    }
}

let allGifts = [];
let queue = [];
let currentUser = "";
let respondents = [];
let pendingCount = 0;
let failedSaves = [];
let history = [];
let reviewData = [];
let editingIndex = null;

function loadGifts() {
    return fetch(`${API}?action=gifts&lang=${lang}`)
        .then(response => response.json())
        .then(data => {
            allGifts = data;
            return data;
        })
        .catch(err => {
            console.error("Nepodařilo se načíst seznam dárků:", err);
            return allGifts;
        });
}

// Dárky se stahují na pozadí hned při otevření appky (souběžně s tím, jak
// si člověk vybírá jméno), aby po kliknutí na "Hodnotit dárky" nebylo
// třeba čekat.
const giftsReady = loadGifts();

async function loadRespondents() {

    try {
        const response = await fetch(`${API}?action=respondents`);
        respondents = await response.json();
        respondents.sort((a, b) => a.localeCompare(b, "cs"));

        const list = document.getElementById("respondentList");
        list.innerHTML = "";

        respondents.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            list.appendChild(option);
        });

        const select = document.getElementById("personSelect");
        respondents.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Nepodařilo se načíst seznam respondentů:", err);
    }
}

// Odešle odpověď na pozadí, aniž by appka musela čekat na výsledek.
// Při chybě (např. výpadek připojení) se požadavek uloží do fronty
// k opětovnému odeslání a nahoře se zobrazí upozornění.
function saveResponse(payload) {
    pendingCount++;
    updateSaveStatus();

    return fetch(API, {
        method: "POST",
        body: JSON.stringify(payload)
    })
        .then(() => {
            pendingCount--;
            updateSaveStatus();
        })
        .catch(err => {
            console.error("Uložení odpovědi selhalo:", err);
            pendingCount--;
            failedSaves.push(payload);
            updateSaveStatus();
        });
}

function updateSaveStatus() {
    const status = document.getElementById("saveStatus");
    if (!status) return;

    if (failedSaves.length > 0) {
        status.innerHTML =
            `${t("save_error_prefix", { count: failedSaves.length })} ` +
            `<button type="button" onclick="retryFailedSaves()">${t("retry_button")}</button>`;
        status.classList.add("saveError");
    } else if (pendingCount > 0) {
        status.textContent = t("saving");
        status.classList.remove("saveError");
    } else {
        status.textContent = "";
        status.classList.remove("saveError");
    }
}

async function retryFailedSaves() {
    const toRetry = failedSaves;
    failedSaves = [];
    updateSaveStatus();

    for (const payload of toRetry) {
        await saveResponse(payload);
    }
}

window.addEventListener("beforeunload", (e) => {
    if (failedSaves.length > 0 || pendingCount > 0) {
        e.preventDefault();
        e.returnValue = "";
    }
});

function findExistingName(input) {
    const lower = input.trim().toLowerCase();
    return respondents.find(name => name.toLowerCase() === lower) || null;
}

async function startSurvey() {

    const raw = document.getElementById("nameInput").value.trim();
    const message = document.getElementById("loginMessage");
    message.textContent = "";

    if (!raw) {
        message.textContent = t("name_required");
        return;
    }

    const existing = findExistingName(raw);

    if (!existing) {
        const confirmed = confirm(t("confirm_new_name", { name: raw }));

        if (!confirmed) {
            message.textContent = t("check_name");
            return;
        }
    }

    currentUser = existing || raw;

    const startButton = document.getElementById("startButton");
    startButton.disabled = true;
    startButton.textContent = t("loading");

    try {
        // Požadavek na start a dárky (pokud ještě nedoběhly z přednačtení)
        // běží souběžně, ne za sebou.
        const [startResult] = await Promise.all([
            fetch(API, {
                method: "POST",
                body: JSON.stringify({ type: "start", name: currentUser })
            }).then(r => r.json()),
            giftsReady
        ]);

        const alreadyVoted = new Set(startResult.alreadyVoted || []);
        queue = allGifts.filter(item => !alreadyVoted.has(item.gift));

        document.getElementById("loginScreen").style.display = "none";

        if (queue.length === 0) {
            showFinishScreen(t("all_done"));
        } else {
            document.getElementById("surveyScreen").style.display = "block";
            showGift();
        }
    } catch (err) {
        console.error(err);
        message.textContent = t("load_start_error");
    } finally {
        startButton.disabled = false;
        startButton.textContent = t("start_button");
    }
}

function showGift() {

    document.getElementById("giftName").textContent = queue[0].giftDisplay;

    document.getElementById("progress").textContent =
        `${allGifts.length - queue.length + 1} / ${allGifts.length}`;
}

function updateSliderValue(slider, labelId) {
    const value = Number(slider.value);
    const label = document.getElementById(labelId);

    label.textContent = value;
    label.style.color = value > 0 ? "#4f9d70" : value < 0 ? "#d97a63" : "#9a9690";
}

function resetVoteControls() {
    const slider = document.getElementById("scoreSlider");
    slider.value = 0;
    updateSliderValue(slider, "sliderValue");
    document.getElementById("commentInput").value = "";
}

const VOTE_CONFIRM_DELAY_MS = 900;
let voteInFlight = false;

function submitVote() {

    // Pojistka proti dvojímu odeslání (např. Enter v komentáři hned po
    // posunu posuvníku) — bez ní by druhé volání během čekání na potvrzení
    // omylem přeskočilo další dárek navíc.
    if (voteInFlight) return;
    voteInFlight = true;

    const current = editingIndex !== null ? reviewData[editingIndex] : queue[0];
    const gift = current.gift;
    const giftDisplay = current.giftDisplay;
    const score = Number(document.getElementById("scoreSlider").value);
    const comment = document.getElementById("commentInput").value.trim();

    // Uložení běží na pozadí hned, appka ale chvíli počká, než přejde dál —
    // aby bylo vidět, že se hodnocení opravdu zaznamenalo.
    saveResponse({ name: currentUser, gift: gift, score: score, comment: comment });

    showVoteConfirm(score);

    setTimeout(() => {
        voteInFlight = false;
        hideVoteConfirm();
        finishVote(gift, giftDisplay, score, comment);
    }, VOTE_CONFIRM_DELAY_MS);
}

function showVoteConfirm(score) {
    const confirmEl = document.getElementById("voteConfirm");
    const sign = score > 0 ? "+" : "";

    confirmEl.textContent = t("vote_recorded", { score: `${sign}${score}` });
    confirmEl.style.display = "block";

    // Zamčeno na dobu potvrzení, ať mezitím nejde odejít (Zpět/Zrušit
    // úpravu) a nekolidovat s odloženým finishVote().
    document.getElementById("scoreSlider").disabled = true;
    document.getElementById("commentInput").disabled = true;
    document.getElementById("backButton").disabled = true;
    document.getElementById("cancelEditButton").disabled = true;
    document.getElementById("voteHint").style.display = "none";
}

function hideVoteConfirm() {
    document.getElementById("voteConfirm").style.display = "none";
    document.getElementById("scoreSlider").disabled = false;
    document.getElementById("commentInput").disabled = false;
    document.getElementById("backButton").disabled = false;
    document.getElementById("cancelEditButton").disabled = false;
    document.getElementById("voteHint").style.display = "block";
}

function finishVote(gift, giftDisplay, score, comment) {

    if (editingIndex !== null) {
        reviewData[editingIndex] = { gift: gift, giftDisplay: giftDisplay, score: score, comment: comment };
        editingIndex = null;
        sortReviewData();
        document.getElementById("cancelEditButton").style.display = "none";
        document.getElementById("surveyScreen").style.display = "none";
        renderReview();
        document.getElementById("reviewScreen").style.display = "block";
        return;
    }

    history.push({ gift: gift, giftDisplay: giftDisplay, score: score, comment: comment });
    queue.shift();
    updateBackButtons();

    if (queue.length === 0) {
        document.getElementById("surveyScreen").style.display = "none";
        showFinishScreen(t("finish_title_default"));
    } else {
        resetVoteControls();
        showGift();
    }
}

function cancelEdit() {
    editingIndex = null;
    document.getElementById("cancelEditButton").style.display = "none";
    document.getElementById("surveyScreen").style.display = "none";
    document.getElementById("reviewScreen").style.display = "block";
}

// Přehled dárků seřazený podle popularity napříč všemi hlasujícími —
// nevyžaduje zadání jména, jde na něj rovnou z úvodní obrazovky.
async function showOverview() {

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("reviewScreen").style.display = "none";
    document.getElementById("overviewScreen").style.display = "block";

    const container = document.getElementById("overviewList");
    container.innerHTML = `<p class="hint">${t("loading")}</p>`;

    try {
        const response = await fetch(`${API}?action=giftstats&lang=${lang}`);
        const stats = await response.json();
        renderOverview(stats);
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="message">${t("overview_load_error")}</p>`;
    }
}

function voteCountLabel(count) {
    if (count === 0) return t("votes_none");
    if (count === 1) return `1 ${t("vote_one")}`;
    if (count <= 4) return `${count} ${t("vote_few")}`;
    return `${count} ${t("vote_many")}`;
}

function renderOverview(stats) {

    const container = document.getElementById("overviewList");
    container.innerHTML = "";

    if (stats.length === 0) {
        container.innerHTML = `<p>${t("overview_empty")}</p>`;
        return;
    }

    stats.forEach(item => {
        const row = document.createElement("div");
        row.className = "reviewItem";

        const hasVotes = item.voteCount > 0;
        const scoreColor = !hasVotes ? "#9a9690" : item.avgScore > 0 ? "#4f9d70" : item.avgScore < 0 ? "#d97a63" : "#9a9690";
        const scoreText = hasVotes ? formatScore(item.avgScore) : "—";

        row.innerHTML =
            `<div class="reviewGift">${escapeHtml(item.giftDisplay)}</div>` +
            `<div class="reviewScore" style="color:${scoreColor}">${scoreText}</div>` +
            `<div class="hint" style="margin-top:2px;">${voteCountLabel(item.voteCount)}</div>`;

        container.appendChild(row);
    });
}

// Zobrazí odpovědi konkrétního člověka (vybraného v přehledu) s možností
// úpravy — nemusí to být appka mého vlastního hlasování, klidně někdo jiný.
async function loadReviewFor(name) {

    currentUser = name;

    const container = document.getElementById("reviewList");
    document.getElementById("reviewTitle").textContent = t("responses_for", { name: name });
    container.innerHTML = `<p class="hint">${t("loading")}</p>`;

    try {
        const response = await fetch(`${API}?action=myresponses&name=${encodeURIComponent(name)}&lang=${lang}`);
        reviewData = await response.json();
        sortReviewData();
        renderReview();
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="message">${t("review_load_error")}</p>`;
    }
}

async function onPersonSelected() {

    const select = document.getElementById("personSelect");
    const name = select.value;
    if (!name) return;

    select.value = "";

    document.getElementById("overviewScreen").style.display = "none";
    document.getElementById("reviewScreen").style.display = "block";

    await loadReviewFor(name);
}

async function showHighlights() {

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("highlightsScreen").style.display = "block";

    const listIds = ["topFavoriteList", "topUnpopularList", "topControversialList"];
    listIds.forEach(id => {
        document.getElementById(id).innerHTML = `<p class="hint">${t("loading")}</p>`;
    });

    try {
        const response = await fetch(`${API}?action=highlights&lang=${lang}`);
        const data = await response.json();

        renderHighlightList("topFavoriteList", data.topFavorite, item =>
            `${formatScore(item.avgScore)} · ${voteCountLabel(item.voteCount)}`);

        renderHighlightList("topUnpopularList", data.topUnpopular, item =>
            `${formatScore(item.avgScore)} · ${voteCountLabel(item.voteCount)}`);

        renderHighlightList("topControversialList", data.topControversial, item =>
            `${t("range_label", { min: item.min, max: item.max })} · ${voteCountLabel(item.voteCount)}`);
    } catch (err) {
        console.error(err);
        listIds.forEach(id => {
            document.getElementById(id).innerHTML = `<p class="message">${t("highlights_load_error")}</p>`;
        });
    }
}

function renderHighlightList(containerId, items, subtitleFn) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = `<p class="hint">${t("highlights_not_enough")}</p>`;
        return;
    }

    items.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "highlightRow";

        row.innerHTML =
            `<span class="highlightRank">${index + 1}.</span>` +
            `<div class="highlightBody">` +
                `<div class="highlightGift">${escapeHtml(item.giftDisplay)}</div>` +
                `<div class="hint" style="margin-top:2px;text-align:left;">${subtitleFn(item)}</div>` +
                renderDistribution(item.histogram) +
            `</div>`;

        container.appendChild(row);
    });
}

// Vizualizace rozmístění hlasů na škále -10..+10 — puntík na místě dané
// hodnoty, velikost puntíku podle toho, kolik lidí zrovna tolik dalo.
function renderDistribution(histogram) {
    if (!histogram || histogram.length === 0) return "";

    const maxCount = Math.max(...histogram.map(h => h.count));
    const minSize = 8;
    const maxSize = 22;

    const dots = histogram.map(h => {
        const fraction = (h.score + 10) / 20;
        const size = minSize + (h.count / maxCount) * (maxSize - minSize);
        const radius = size / 2;
        // Odsazeno o poloměr tečky, ať se u krajních hodnot (-10/+10)
        // vejde celá dovnitř pásu místo přesahu za okraj.
        const left = `calc(${radius}px + ${fraction} * (100% - ${size}px))`;
        const sign = h.score > 0 ? "+" : "";
        const title = `${sign}${h.score}: ${voteCountLabel(h.count)}`;

        return `<div class="distDot" style="left:${left}; width:${size}px; height:${size}px;" title="${title}"></div>`;
    }).join("");

    return `<div class="distStrip">${dots}</div>`;
}

function showAddGiftScreen() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("addGiftScreen").style.display = "block";
    document.getElementById("addGiftMessage").textContent = "";
}

async function submitNewGift() {

    const input = document.getElementById("newGiftInput");
    const gift = input.value.trim();
    const message = document.getElementById("addGiftMessage");
    const button = document.getElementById("addGiftButton");

    if (!gift) {
        message.textContent = t("gift_name_required");
        return;
    }

    button.disabled = true;
    message.textContent = "";

    try {
        const response = await fetch(API, {
            method: "POST",
            body: JSON.stringify({ type: "addgift", gift: gift, lang: lang })
        }).then(r => r.json());

        if (response.error) {
            message.textContent = response.error;
        } else {
            message.textContent = t("addgift_success", { gift: gift });
            input.value = "";
            allGifts.push({ gift: gift, giftDisplay: gift });
        }
    } catch (err) {
        console.error(err);
        message.textContent = t("addgift_error");
    } finally {
        button.disabled = false;
    }
}

function sortReviewData() {
    // Od nejvyššího hodnocení po nejnižší.
    reviewData.sort((a, b) => b.score - a.score);
}

function renderReview() {

    const container = document.getElementById("reviewList");
    container.innerHTML = "";

    if (reviewData.length === 0) {
        container.innerHTML = `<p>${t("review_empty")}</p>`;
        return;
    }

    reviewData.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "reviewItem";

        const scoreColor = item.score > 0 ? "#4f9d70" : item.score < 0 ? "#d97a63" : "#9a9690";

        row.innerHTML =
            `<div class="reviewGift">${escapeHtml(item.giftDisplay)}</div>` +
            `<div class="reviewScore" style="color:${scoreColor}">${item.score}</div>` +
            (item.comment ? `<div class="reviewComment">${escapeHtml(item.comment)}</div>` : "") +
            `<button type="button" class="secondary" onclick="editReviewItem(${index})">${t("edit_button")}</button>`;

        container.appendChild(row);
    });
}

function editReviewItem(index) {

    const item = reviewData[index];
    editingIndex = index;

    document.getElementById("reviewScreen").style.display = "none";
    document.getElementById("surveyScreen").style.display = "block";

    document.getElementById("giftName").textContent = item.giftDisplay;
    document.getElementById("progress").textContent = t("editing_progress");

    const slider = document.getElementById("scoreSlider");
    slider.value = item.score;
    updateSliderValue(slider, "sliderValue");
    document.getElementById("commentInput").value = item.comment;

    document.getElementById("backButton").style.display = "none";
    document.getElementById("cancelEditButton").style.display = "block";
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// Vrátí appku na naposledy ohodnocený dárek, ať se dá hodnocení opravit.
// Odeslání stejného jména+dárku znovu ho v Sheetu jen přepíše (viz
// Code.gs), takže tím nevznikne duplicitní řádek.
function goBack() {

    if (history.length === 0) return;

    const prev = history.pop();
    queue.unshift({ gift: prev.gift, giftDisplay: prev.giftDisplay });
    updateBackButtons();

    document.getElementById("finishScreen").style.display = "none";
    document.getElementById("surveyScreen").style.display = "block";

    showGift();

    const slider = document.getElementById("scoreSlider");
    slider.value = prev.score;
    updateSliderValue(slider, "sliderValue");
    document.getElementById("commentInput").value = prev.comment;
}

function updateBackButtons() {
    const display = history.length > 0 ? "block" : "none";
    document.getElementById("backButton").style.display = display;
    document.getElementById("finishBackButton").style.display = display;
}

function showFinishScreen(title) {
    document.getElementById("finishTitle").textContent = title;
    document.getElementById("finishScreen").style.display = "block";
}

function saveExtraGift() {

    const giftInput = document.getElementById("extraGift");
    const gift = giftInput.value.trim();
    const scoreSlider = document.getElementById("extraScoreSlider");
    const score = Number(scoreSlider.value);
    const commentInput = document.getElementById("extraComment");
    const comment = commentInput.value.trim();
    const message = document.getElementById("extraMessage");

    if (!gift) {
        message.textContent = t("gift_name_required");
        return;
    }

    saveResponse({ name: currentUser, gift: gift, score: score, comment: comment });

    message.textContent = t("extra_added", { gift: gift });
    giftInput.value = "";
    scoreSlider.value = 0;
    updateSliderValue(scoreSlider, "extraSliderValue");
    commentInput.value = "";
}

function submitOnEnter(inputId, submitFn) {
    document.getElementById(inputId).addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitFn();
        }
    });
}

submitOnEnter("commentInput", submitVote);
submitOnEnter("extraComment", saveExtraGift);

// "change" (na rozdíl od "input") se spustí až po dokončení tahu/kliknutí,
// takže samotné nastavení posuvníku rovnou odešle hodnocení.
document.getElementById("scoreSlider").addEventListener("change", submitVote);

applyStaticTranslations();
updateLangButtons();
loadRespondents();
