const API =
"https://script.google.com/macros/s/AKfycbwSZVAII3Mk3i6H16w40aJwebHam6-RXSKDHKnas2fh0XUtuERMCu1_soiEGM8UdP4i/exec";

let allGifts = [];
let queue = [];
let currentUser = "";
let respondents = [];
let pendingCount = 0;
let failedSaves = [];

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

        const list = document.getElementById("respondentList");
        list.innerHTML = "";

        respondents.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            list.appendChild(option);
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
    label.style.color = value > 0 ? "#4caf50" : value < 0 ? "#d32f2f" : "#616161";
}

function resetVoteControls() {
    const slider = document.getElementById("scoreSlider");
    slider.value = 0;
    updateSliderValue(slider, "sliderValue");
    document.getElementById("commentInput").value = "";
}

function submitVote() {

    const gift = queue[0];
    const score = Number(document.getElementById("scoreSlider").value);
    const comment = document.getElementById("commentInput").value.trim();

    // Uložení běží na pozadí — appka rovnou pokračuje na další dárek,
    // ať se nečeká zbytečně po každém kliknutí.
    saveResponse({ name: currentUser, gift: gift, score: score, comment: comment });

    queue.shift();

    if (queue.length === 0) {
        document.getElementById("surveyScreen").style.display = "none";
        showFinishScreen("Hotovo 🎉");
    } else {
        resetVoteControls();
        showGift();
    }
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

loadRespondents();
