
//#region DOM-element

//DOM-element
const selector = document.getElementById("text-selector");
const radioBtns = Array.from(document.querySelectorAll(".radio-lng"));
const chkCaseToggle = document.getElementById("case-toggle");
const textarea = document.getElementById("game-textarea");
const textinput = document.getElementById("textinput");
const gameBtn = document.getElementById("game-btn");
const selectedTextTitle = document.getElementById("selected-text-title");
const selectedTextInfo = document.getElementById("selected-text-info");
const muteBtn = document.getElementById("mute");
const buzzAudio = document.getElementById("buzzAudio");
const stats = Array.from(document.getElementsByClassName("stat-value"));
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


//#endregion

//#region Variabler

let texts; // Array med texter från JSON-fil
let chars; // Array över samtliga tecken i vald text
let charCounter; // Värdet på aktiv bokstav
let errorsCounter; // Antalet felslag som registrerats hittills
let startTime; // Timestamp vid första slag på tangentbord
let wpmTimer; // Timer som kör ord/minuten funktioner
let xAxisCounter = 0; // variabel till grafens x-axelvärde

//#endregion

//#region Event listeners
// Startar eller stoppar spel beroende på om knappen har klassen stop
gameBtn.addEventListener("click", () => {
    if(!gameBtn.classList.contains("stop")){
        startGame();
    } else {
        stopGame();
    }
});

// Vid byte av text i selectorn
selector.addEventListener("change", () => {
    stopGame();
    clearTextArea();
    fillTextArea();
    fillTextArray();
    setInfoText();
});

// Loop över radiobuttons och tilldelar funktioner
for (let i = 0; i < radioBtns.length; i++) {
    const rb = radioBtns[i];
    rb.addEventListener("click", () => {
        stopGame();
        clearTextSelector();
        fillTextSelector();
        clearTextArea();
        fillTextArea();
        fillTextArray();
        setInfoText();
    });
}

// Vid checkboxklick
chkCaseToggle.addEventListener("click", () => {
    stopGame();
});

// Vid slag på tangentbord, kopplat till input
textinput.addEventListener("keydown", (event) => {
    let key = event.key;
    EvaluateKey(key);
});

//#endregion

// Funktion som körs vid fönsterladdning
function onInit(){
    // Ger arrayen texts värden från JSON-fil
    loadJSON( (response) => {
        texts = JSON.parse(response);
    });

    fillTextSelector();
    fillTextArea();
    fillTextArray();
    setInfoText();
    initCanvas();
    textinput.disabled = true;
}

// Tar emot inkommen sträng från tangentbordet och utför uppgifter beroende på slag
function EvaluateKey(key){
    //Vid första slag på tangentbord
    if(startTime == null){
        startTime = Date.now();
        setWPMInterval(); //Startar WPM-timer
    }
    // Om slaget är någon av tecknen
    if(/^[a-öA-Ö,.:;'!\- ]$/.test(key)){
        // Om slaget är mellanslag
        if(key == " "){
            textinput.value=""; //Töm input
        }
        markCorrectChar(key);
        // Så länge det finns fler tecken kvar att utvärdera
        if(chars.length > charCounter){
            markActiveChar();
        }
        // När det inte finns fler tecken att utvärdera
        else{
            chars[charCounter - 1].classList.remove("active-char"); // Tar bort highlighter
            endGame();
        }
    } 
    // Vid radera-knappen, backa och ta bort värden
    else if(key == "Backspace" && charCounter > 0){
       correctError();
    }
}

// Hämtar JSON-fil med texter
function loadJSON(callback){
    const obj = new XMLHttpRequest();
    obj.overrideMimeType("application/json");
    obj.open('GET', 'texts.json', false);
    obj.onreadystatechange = () => {
        if (obj.readyState == 4 && obj.status == "200") {
            callback(obj.responseText);
        }
    };
    obj.send();  
}

// Fyller selectorn med titlar från texts arrayen, beroende på valt språk
function fillTextSelector(){
    let option, filteredTexts;
    switch (true) {
        case radioBtns[0].checked:
            filteredTexts = texts.filter(t => t.language == "swedish");
            break;
        case radioBtns[1].checked:
            filteredTexts = texts.filter(t => t.language == "english");
            break;
    }
    filteredTexts.sort((a,b) => (a.title > b.title) ? 1 : -1);
    for (let i = 0; i < filteredTexts.length; i++) {
        const text = filteredTexts[i];
        option = document.createElement("option");
        option.text = text.title;
        selector.appendChild(option);
    }
}

// Fyller text-arean med data från vald text från textarrayen
function fillTextArea(){
    let span, node, text;
    text = texts.find(t => t.title == selector.value)

    for (let i = 0; i < text.text.split("").length; i++) {
        const character = text.text[i];
        span = document.createElement("span");
        node = document.createTextNode(character);
        span.id = i;
        span.appendChild(node);
        textarea.appendChild(span);
    }
}

// Fyller chars-arrayen med bokstäver från text-areans span-element
function fillTextArray(){
    chars = Array.from(textarea.querySelectorAll("span"));
}

// Sätter information om vald text till gränssnittet
function setInfoText(){
    const text = texts.find(t => t.title == selector.value);
    const wordCount = text.text.split(" ").length;
    selectedTextTitle.innerHTML = text.title;
    selectedTextInfo.innerHTML = text.author + " (" + wordCount + " ord, " + 
    chars.length + " tecken)"
}

// Uppgifter som utförs vid spelstart
function startGame(){
    resetCounters();
    resetLetters();
    markActiveChar();
    startTime = null; // Nollar starttiden
    textInputSettings();
    setWPMtext("--", "--", "0", "100%"); // Skickar in default-värden till stats
    gameBtn.classList.add("stop"); // Lägger till klassen stop till startknappen
    ctx.canvas.width = ctx.canvas.width; // Tar bort sträck från canvas
    ctx.moveTo(-1,100); // Flyttar canvas startpunkt till längst ned till vänster, -1 i x-led
}

// Uppgifter som utförs vid spelets slut
function endGame(){
    clearWPMInterval();
    textInputSettings();
    gameBtn.classList.remove("stop"); // Tar bort klassen stop från startknappen
    startTime = null; // Nollar starttiden
    xAxisCounter = 0; // Nollar grafens x-axelposition
}

// Uppgifter som utförs då spelet avbryts
function stopGame(){
    endGame();
    setWPMtext("", "", "", "") // Rensar värden från stats
    resetCounters();
    resetLetters();
    ctx.canvas.width = ctx.canvas.width; // Tar bort grafen från canvas
}

// Rensar charCounter och errorsCounter
function resetCounters(){
    if(charCounter != 0)
        charCounter = 0;
    if(errorsCounter != 0)
        errorsCounter = 0;
}

// Rensar klasser från span-elementen i arrayen chars
function resetLetters(){
    if(chars.length > 0){
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            char.className = "";
        }
    }
}

// Tillåter/spärrar input till textinput beroende på om spelet är startat eller ej
// Rensar även fältet
function textInputSettings(){
    if(gameBtn.classList.contains("stop")){
        textinput.disabled = true;
        textinput.blur();
    } else {
        textinput.disabled = false;
        textinput.focus();
    }
    textinput.value = ""; // Tar bort värde från textinput
}

// Rensar fält i selectorn
function clearTextSelector(){
    for (let i = selector.options.length - 1; i >= 0; i--){
        selector.options[i] = null;
    }
}

// Rensar textarean
function clearTextArea(){
    textarea.innerHTML="";
}

// Highlightar aktuell char med active-char klass, tar bort den klassen från tidigare
// element
function markActiveChar(){
    if(chars[charCounter].id != 0){
        const previousChar = chars.find(c => c.id == chars[charCounter].id - 1);
        previousChar.classList.remove("active-char");
    }
    chars[charCounter].classList.add("active-char");
}

// Tar emot tecken, utvärderar mot aktuell char (beroende på case-sensitivity)
// Ökar errorsCounter vid felslag, ökar charCounter, spelar ljud vid fel om ej mutad
// Sätter CSS-klass till char
function markCorrectChar(key){
    if(chkCaseToggle.checked && chars[charCounter].innerHTML.toLowerCase() == key.toLowerCase()){
        chars[charCounter].classList.add("correct-char");
    }
    else if(chars[charCounter].innerHTML == key){
        chars[charCounter].classList.add("correct-char");
    }
    else {
        chars[charCounter].classList.add("incorrect-char");
        errorsCounter++;
        if(!muteBtn.checked){
            playErrorSound();
        }
    }
    charCounter++;
}

// Backar aktiva tecknet, minskar counters och tar bort klasser från backade span
function correctError(){
    charCounter--;
    chars[charCounter + 1].classList.remove("active-char");
    chars[charCounter].classList.add("active-char");
    if(chars[charCounter].classList.contains("incorrect-char")){
        chars[charCounter].classList.remove("incorrect-char");
        errorsCounter--;
    }else if(chars[charCounter].classList.contains("correct-char")){
        chars[charCounter].classList.remove("correct-char");
    }
}

// Spelar upp ljudeffekt buzzAudio
function playErrorSound(){
    buzzAudio.play();
}

// Returnerar tidsstämpel från tiden spelet startade tills nu
function getElapsedTime(){
    let currentTime = Date.now();
    let elapsedTime = (currentTime - startTime) / 60000;
    return elapsedTime;
}

// Räknar ut och returnerar bruttoWPM
function getGrossWPM(){
    let grossWPM = Math.round((charCounter / 5) / getElapsedTime());
    return grossWPM;
}

// Räknar ut och returnerar nettoWPM
function getNetWPM(){
    let netWPM = Math.round(getGrossWPM() - (( errorsCounter / 5) / getElapsedTime()));
    return netWPM;
}

//Räknar ut procent felslag
function getErrorsPercentage(){
    let percent = Math.round(100 - ((errorsCounter * 100) / charCounter));
    return percent;
}

//Tar emot total WPM, och sätter DOM-elementen (text) till aktuella värden
function setWPMtext(grossWPM, netWPM, errorsCount, percentage){
    stats[0].innerHTML = grossWPM;
    stats[1].innerHTML = netWPM;
    stats[2].innerHTML = errorsCount;
    stats[3].innerHTML = percentage;
}

//Sätter höjd och bredd till canvas
function initCanvas(){
    ctx.canvas.width = 200;
    ctx.canvas.height = 100;
}

//Funktion för att rita ut graf över WPM i canvas
function drawCanvas(){
    ctx.strokeStyle = "#ff5cf1"; //Färgen på linjen som ritas
    //Sparar en bild av canvasen just nu, flyttar den -1 i x-led och ritar en punkt till
    if(xAxisCounter > (ctx.canvas.width - 10)){
        const imageData = ctx.getImageData(1, 0, ctx.canvas.width-1, ctx.canvas.height);
        ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
        ctx.putImageData(imageData, 0, 0);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo((ctx.canvas.width - 12), (ctx.canvas.height - getNetWPM()));
        ctx.lineTo((ctx.canvas.width - 11), (ctx.canvas.height - getNetWPM()));
    }
    //Ritar ut WPM i y-led samt position i x-led. Ökar x-led med 1
    else{
        ctx.lineTo((xAxisCounter - 1), (ctx.canvas.height - getNetWPM()));
        xAxisCounter++;
    }
    //Själva ritandet
    ctx.stroke();
}

// Funktion för att sätta timer för WPM-beräkning och kör de funktionerna enligt satt ms
function setWPMInterval(){
    wpmTimer = setInterval(() => {
        setWPMtext(getGrossWPM(), getNetWPM(), errorsCounter, getErrorsPercentage()  + "%");
        drawCanvas();
    }, 100);
}

// Avslutar timern
function clearWPMInterval(){
    clearInterval(wpmTimer);
}

// Event-lister för när fönstret laddats
window.addEventListener("load", onInit(), false);
