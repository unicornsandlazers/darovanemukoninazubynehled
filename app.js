const API =
"https://script.google.com/macros/s/AKfycbwSZVAII3Mk3i6H16w40aJwebHam6-RXSKDHKnas2fh0XUtuERMCu1_soiEGM8UdP4i/exec";

let allGifts = [];
let queue = [];
let currentUser = "";
let respondents = [];
let pendingCount = 0;
let failedSaves = [];
let history = [];
let reviewData = [];
let editingIndex = null;

// Dárky se stahují na pozadí hned při otevření appky (souběžně s tím, jak
// si člověk vybírá jméno), aby po kliknutí na "Začít" nebylo třeba čekat.
const giftsReady = fetch(`${API}?action=gifts`)
    .then(response => response.json())
    .then(data => { allGifts = data; })
    .catch(err => console.error("Nepodařilo se načíst seznam dárků:", err));

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
            `⚠️ ${failedSaves.length} odpověď(i) se nepodařilo uložit. ` +
            `<button type="button" onclick="retryFailedSaves()">Zkusit znovu</button>`;
        status.classList.add("saveError");
    } else if (pendingCount > 0) {
        status.textContent = "Ukládám…";
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
        message.textContent = "Vyplň prosím jméno.";
        return;
    }

    const existing = findExistingName(raw);

    if (!existing) {
        const confirmed = confirm(
            `Jméno "${raw}" jsme zatím v seznamu nenašli. Chceš pokračovat jako nový respondent?`
        );

        if (!confirmed) {
            message.textContent = "Zkontroluj prosím jméno, nebo ho vyber ze seznamu.";
            return;
        }
    }

    currentUser = existing || raw;

    const startButton = document.getElementById("startButton");
    startButton.disabled = true;
    startButton.textContent = "Načítám…";

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
        queue = allGifts.filter(gift => !alreadyVoted.has(gift));

        document.getElementById("loginScreen").style.display = "none";

        if (queue.length === 0) {
            showFinishScreen("Zatím jsi ohodnotil/a všechny dárky ze seznamu. Díky! 🎉");
        } else {
            document.getElementById("surveyScreen").style.display = "block";
            showGift();
        }
    } catch (err) {
        console.error(err);
        message.textContent = "Něco se pokazilo při načítání. Zkus to prosím znovu.";
    } finally {
        startButton.disabled = false;
        startButton.textContent = "Začít";
    }
}

function showGift() {

    document.getElementById("giftName").textContent = queue[0];

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

    const gift = editingIndex !== null ? reviewData[editingIndex].gift : queue[0];
    const score = Number(document.getElementById("scoreSlider").value);
    const comment = document.getElementById("commentInput").value.trim();

    // Uložení běží na pozadí hned, appka ale chvíli počká, než přejde dál —
    // aby bylo vidět, že se hodnocení opravdu zaznamenalo.
    saveResponse({ name: currentUser, gift: gift, score: score, comment: comment });

    showVoteConfirm(score);

    setTimeout(() => {
        voteInFlight = false;
        hideVoteConfirm();
        finishVote(gift, score, comment);
    }, VOTE_CONFIRM_DELAY_MS);
}

function showVoteConfirm(score) {
    const confirmEl = document.getElementById("voteConfirm");
    const sign = score > 0 ? "+" : "";

    confirmEl.textContent = `✓ Zaznamenáno: ${sign}${score}`;
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

function finishVote(gift, score, comment) {

    if (editingIndex !== null) {
        reviewData[editingIndex] = { gift: gift, score: score, comment: comment };
        editingIndex = null;
        sortReviewData();
        document.getElementById("cancelEditButton").style.display = "none";
        document.getElementById("surveyScreen").style.display = "none";
        renderReview();
        document.getElementById("reviewScreen").style.display = "block";
        return;
    }

    history.push({ gift: gift, score: score, comment: comment });
    queue.shift();
    updateBackButtons();

    if (queue.length === 0) {
        document.getElementById("surveyScreen").style.display = "none";
        showFinishScreen("Hotovo 🎉");
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
    container.innerHTML = "<p class=\"hint\">Načítám…</p>";

    try {
        const response = await fetch(`${API}?action=giftstats`);
        const stats = await response.json();
        renderOverview(stats);
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p class=\"message\">Nepodařilo se načíst přehled. Zkus to prosím znovu.</p>";
    }
}

function voteCountLabel(count) {
    if (count === 0) return "zatím bez hlasů";
    if (count === 1) return "1 hlas";
    if (count <= 4) return `${count} hlasy`;
    return `${count} hlasů`;
}

function renderOverview(stats) {

    const container = document.getElementById("overviewList");
    container.innerHTML = "";

    if (stats.length === 0) {
        container.innerHTML = "<p>Zatím tu nejsou žádné dárky.</p>";
        return;
    }

    stats.forEach(item => {
        const row = document.createElement("div");
        row.className = "reviewItem";

        const hasVotes = item.voteCount > 0;
        const scoreColor = !hasVotes ? "#9a9690" : item.avgScore > 0 ? "#4f9d70" : item.avgScore < 0 ? "#d97a63" : "#9a9690";
        const scoreText = hasVotes ? (item.avgScore > 0 ? "+" : "") + item.avgScore.toFixed(1) : "—";

        row.innerHTML =
            `<div class="reviewGift">${escapeHtml(item.gift)}</div>` +
            `<div class="reviewScore" style="color:${scoreColor}">${scoreText}</div>` +
            `<div class="hint" style="margin-top:2px;">${voteCountLabel(item.voteCount)}</div>`;

        container.appendChild(row);
    });
}

// Zobrazí odpovědi konkrétního člověka (vybraného v přehledu) s možností
// úpravy — nemusí to být appka mého vlastního hlasování, klidně někdo jiný.
async function onPersonSelected() {

    const select = document.getElementById("personSelect");
    const name = select.value;
    if (!name) return;

    select.value = "";
    currentUser = name;

    const container = document.getElementById("reviewList");
    document.getElementById("reviewTitle").textContent = `Odpovědi: ${name}`;
    container.innerHTML = "<p class=\"hint\">Načítám…</p>";

    document.getElementById("overviewScreen").style.display = "none";
    document.getElementById("reviewScreen").style.display = "block";

    try {
        const response = await fetch(`${API}?action=myresponses&name=${encodeURIComponent(name)}`);
        reviewData = await response.json();
        sortReviewData();
        renderReview();
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p class=\"message\">Nepodařilo se načíst odpovědi. Zkus to prosím znovu.</p>";
    }
}

async function showHighlights() {

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("highlightsScreen").style.display = "block";

    const listIds = ["topFavoriteList", "topUnpopularList", "topControversialList"];
    listIds.forEach(id => {
        document.getElementById(id).innerHTML = "<p class=\"hint\">Načítám…</p>";
    });

    try {
        const response = await fetch(`${API}?action=highlights`);
        const data = await response.json();

        renderHighlightList("topFavoriteList", data.topFavorite, item =>
            `${formatScore(item.avgScore)} · ${voteCountLabel(item.voteCount)}`);

        renderHighlightList("topUnpopularList", data.topUnpopular, item =>
            `${formatScore(item.avgScore)} · ${voteCountLabel(item.voteCount)}`);

        renderHighlightList("topControversialList", data.topControversial, item =>
            `hodnocení od ${item.min} do ${item.max} · ${voteCountLabel(item.voteCount)}`);
    } catch (err) {
        console.error(err);
        listIds.forEach(id => {
            document.getElementById(id).innerHTML = "<p class=\"message\">Nepodařilo se načíst.</p>";
        });
    }
}

function formatScore(score) {
    return (score > 0 ? "+" : "") + score.toFixed(1);
}

function renderHighlightList(containerId, items, subtitleFn) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = "<p class=\"hint\">Zatím není dost hlasů.</p>";
        return;
    }

    items.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "highlightRow";

        row.innerHTML =
            `<span class="highlightRank">${index + 1}.</span>` +
            `<div class="highlightBody">` +
                `<div class="reviewGift">${escapeHtml(item.gift)}</div>` +
                `<div class="hint" style="margin-top:2px;">${subtitleFn(item)}</div>` +
            `</div>`;

        container.appendChild(row);
    });
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
        message.textContent = "Napiš prosím název dárku.";
        return;
    }

    button.disabled = true;
    message.textContent = "";

    try {
        const response = await fetch(API, {
            method: "POST",
            body: JSON.stringify({ type: "addgift", gift: gift })
        }).then(r => r.json());

        if (response.error) {
            message.textContent = response.error;
        } else {
            message.textContent = `Přidáno: "${gift}" ✅ Uvidí ho příští hlasující.`;
            input.value = "";
            allGifts.push(gift);
        }
    } catch (err) {
        console.error(err);
        message.textContent = "Nepodařilo se přidat, zkus to prosím znovu.";
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
        container.innerHTML = "<p>Zatím tu nejsou žádné vyplněné odpovědi.</p>";
        return;
    }

    reviewData.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "reviewItem";

        const scoreColor = item.score > 0 ? "#4f9d70" : item.score < 0 ? "#d97a63" : "#9a9690";

        row.innerHTML =
            `<div class="reviewGift">${escapeHtml(item.gift)}</div>` +
            `<div class="reviewScore" style="color:${scoreColor}">${item.score}</div>` +
            (item.comment ? `<div class="reviewComment">${escapeHtml(item.comment)}</div>` : "") +
            `<button type="button" class="secondary" onclick="editReviewItem(${index})">✏️ Upravit</button>`;

        container.appendChild(row);
    });
}

function editReviewItem(index) {

    const item = reviewData[index];
    editingIndex = index;

    document.getElementById("reviewScreen").style.display = "none";
    document.getElementById("surveyScreen").style.display = "block";

    document.getElementById("giftName").textContent = item.gift;
    document.getElementById("progress").textContent = "Úprava odpovědi";

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
    queue.unshift(prev.gift);
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
        message.textContent = "Napiš prosím název dárku.";
        return;
    }

    saveResponse({ name: currentUser, gift: gift, score: score, comment: comment });

    message.textContent = `Přidáno: "${gift}" ✅`;
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

loadRespondents();
