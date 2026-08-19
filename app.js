const API =
"https://script.google.com/macros/s/AKfycbwSZVAII3Mk3i6H16w40aJwebHam6-RXSKDHKnas2fh0XUtuERMCu1_soiEGM8UdP4i/exec";

let allGifts = [];
let queue = [];
let currentUser = "";
let respondents = [];

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
        await fetch(API, {
            method: "POST",
            body: JSON.stringify({ type: "start", name: currentUser })
        });

        await prepareGiftQueue();

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

async function prepareGiftQueue() {

    const [giftsResponse, votesResponse] = await Promise.all([
        fetch(`${API}?action=gifts`),
        fetch(`${API}?action=uservotes&name=${encodeURIComponent(currentUser)}`)
    ]);

    allGifts = await giftsResponse.json();
    const alreadyVoted = new Set(await votesResponse.json());

    queue = allGifts.filter(gift => !alreadyVoted.has(gift));
}

function showGift() {

    document.getElementById("giftName").textContent = queue[0];

    document.getElementById("progress").textContent =
        `${allGifts.length - queue.length + 1} / ${allGifts.length}`;
}

async function vote(category) {

    const gift = queue[0];

    disableVoteButtons(true);

    try {
        await fetch(API, {
            method: "POST",
            body: JSON.stringify({
                name: currentUser,
                gift: gift,
                category: category
            })
        });

        queue.shift();

        if (queue.length === 0) {
            document.getElementById("surveyScreen").style.display = "none";
            showFinishScreen("Hotovo 🎉");
        } else {
            showGift();
        }
    } catch (err) {
        console.error(err);
        alert("Nepodařilo se uložit odpověď, zkus to prosím znovu.");
    } finally {
        disableVoteButtons(false);
    }
}

function disableVoteButtons(disabled) {
    document.querySelectorAll("#surveyScreen button").forEach(btn => {
        btn.disabled = disabled;
    });
}

function showFinishScreen(title) {
    document.getElementById("finishTitle").textContent = title;
    document.getElementById("finishScreen").style.display = "block";
}

async function saveExtraGift() {

    const giftInput = document.getElementById("extraGift");
    const gift = giftInput.value.trim();
    const category = document.getElementById("extraType").value;
    const message = document.getElementById("extraMessage");
    const button = document.getElementById("addExtraButton");

    if (!gift) {
        message.textContent = "Napiš prosím název dárku.";
        return;
    }

    button.disabled = true;

    try {
        await fetch(API, {
            method: "POST",
            body: JSON.stringify({
                name: currentUser,
                gift: gift,
                category: category
            })
        });

        message.textContent = `Přidáno: "${gift}" ✅`;
        giftInput.value = "";
    } catch (err) {
        console.error(err);
        message.textContent = "Nepodařilo se uložit, zkus to prosím znovu.";
    } finally {
        button.disabled = false;
    }
}

loadRespondents();
