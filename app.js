const API =
"https://script.google.com/macros/s/AKfycbwSZVAII3Mk3i6H16w40aJwebHam6-RXSKDHKnas2fh0XUtuERMCu1_soiEGM8UdP4i/exec";

let gifts = [];
let currentIndex = 0;
let currentUser = "";

async function loadRespondents() {

    const response =
        await fetch(`${API}?action=respondents`);

    const data = await response.json();

    const list =
        document.getElementById("respondentList");

    data.forEach(name => {

        const option =
            document.createElement("option");

        option.value = name;

        list.appendChild(option);

    });
}

async function loadGifts() {

    const response =
        await fetch(`${API}?action=gifts`);

    gifts = await response.json();
}

async function startSurvey() {

    currentUser =
        document.getElementById("nameInput").value.trim();

    if(!currentUser){
        alert("Vyplň jméno");
        return;
    }

    await loadGifts();

    document.getElementById("loginScreen").style.display = "none";

    document.getElementById("surveyScreen").style.display = "block";

    showGift();
}

function showGift(){

    document.getElementById("giftName").innerText =
        gifts[currentIndex];

    document.getElementById("progress").innerText =
        `${currentIndex + 1} / ${gifts.length}`;
}

async function vote(category){

    await fetch(API, {

        method:"POST",

        body:JSON.stringify({
            name:currentUser,
            gift:gifts[currentIndex],
            category:category
        })

    });

    currentIndex++;

    if(currentIndex >= gifts.length){

        document.getElementById("surveyScreen").style.display = "none";

        document.getElementById("finishScreen").style.display = "block";

        return;
    }

    showGift();
}

async function saveExtraGift(){

    const gift =
        document.getElementById("extraGift").value;

    const category =
        document.getElementById("extraType").value;

    if(!gift){
        return;
    }

    await fetch(API, {

        method:"POST",

        body:JSON.stringify({
            name:currentUser,
            gift:gift,
            category:category
        })

    });

    alert("Děkujeme za odpověď.");
}

loadRespondents();
