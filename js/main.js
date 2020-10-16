
//TODO - Kommentera koden
function onInit(){
    loadJSON( (response) => {
        texts = JSON.parse(response);
    });

    fillTextSelector();
    fillTextArea();
    fillTextArray();
    setInfoText();
    textinput.disabled = true;
}

function loadJSON(callback){
    const obj = new XMLHttpRequest();
    obj.overrideMimeType("application/json");
    obj.open('GET', 'texts.json', false);
    obj.onreadystatechange = function () {
        if (obj.readyState == 4 && obj.status == "200") {
            callback(obj.responseText);
        }
    };
    obj.send();  
}

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
    for (let i = 0; i < filteredTexts.length; i++) {
        const text = filteredTexts[i];
        option = document.createElement("option");
        option.text = text.title;
        selector.appendChild(option);
    }
}

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

function fillTextArray(){
    chars = Array.from(textarea.querySelectorAll("span"));
}

function setInfoText(){
    const text = texts.find(t => t.title == selector.value);
    const wordCount = text.text.split(" ").length;
    selectedTextTitle.innerHTML = text.title;
    selectedTextInfo.innerHTML = text.author + " (" + wordCount + " ord, " + 
    chars.length + " tecken)"
}

function startGame(){
    resetCounters()
    resetLetters();
    markActiveChar();
    startTime = null;
    textinput.disabled = false;
    textinput.focus();
    wpmText.innerHTML ="--";
    netWPMText.innerHTML ="--";
    errorsText.innerHTML = "0";
    errorsPercentageText.innerHTML = "100%";
    gameBtn.classList.add("stop");
    ctx.canvas.width = ctx.canvas.width;
    ctx.moveTo(-1,100);
}

function endGame(){
    textinput.blur();
    textinput.disabled = true;
    textinput.value = "";
    startTime = null;
}

function stopGame(){
    wpmText.innerHTML ="";
    netWPMText.innerHTML ="";
    errorsText.innerHTML = "";
    errorsPercentageText.innerHTML = "";
    endGame();
    resetCounters()
    resetLetters();
    gameBtn.classList.remove("stop");
    ctx.canvas.width = ctx.canvas.width;
}

function resetCounters(){
    if(charCounter != 0)
        charCounter = 0;
    if(errorsCounter != 0)
        errorsCounter = 0;
}

function resetLetters(){
    if(chars.length > 0){
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            char.className = "";
        }
    }
}

function clearTextSelector(){
    for (let i = selector.options.length - 1; i >= 0; i--){
        selector.options[i] = null;
    }
}

function clearText(){
    textarea.innerHTML="";
}

function markActiveChar(){
    char = chars.find(c => c.id == charCounter);
    if(char.id != 0){
        const previousChar = chars.find(c => c.id == char.id - 1);
        previousChar.classList.remove("active-char");
    }
    char.classList.add("active-char");
}

function markCorrectChar(key){
    if(chkCaseToggle.checked && char.innerHTML.toLowerCase() == key.toLowerCase()){
        char.classList.add("correct-char");
    }
    else if(char.innerHTML == key){
        char.classList.add("correct-char");
    }
    else {
        char.classList.add("incorrect-char");
        errorsCounter++;
        setNrOfErrorsText();
        if(!muteBtn.checked){
            buzzAudio.play();
        }
    }
}

function getWPM(){
    let currentTime = Date.now();
    let elapsedTime = (currentTime - startTime) / 60000;
    let grossWPM = Math.round((charCounter / 5) / elapsedTime);
    let prevVPM;
    if(netWPM != undefined){
        prevVPM = netWPM;
    }
    netWPM = Math.round(grossWPM - (( errorsCounter / 5) / elapsedTime));
    setWPMtext(grossWPM);
    drawCanvas(prevVPM);
}

function setWPMtext(grossWPM){
    wpmText.innerHTML = grossWPM;
    netWPMText.innerHTML = netWPM;
}

function setNrOfErrorsText(){
    errorsText.innerHTML = errorsCounter;
}

function getErrorsPercentage(){
    let percent = Math.round(100 - ((errorsCounter * 100) / charCounter));
    setErrorsPercentageText(percent);
}

function setErrorsPercentageText(percent){
    errorsPercentageText.innerHTML = percent + "%" 
}

function drawCanvas(prevWPM){
    ctx.strokeStyle = "#ff5cf1";
    if(charCounter > 190 && (chars.length - charCounter) > 10 && chars.length > 200){
        const imageData = ctx.getImageData(1, 0, ctx.canvas.width-1, ctx.canvas.height);
        ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
        ctx.putImageData(imageData, 0, 0);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(188, (ctx.canvas.height - prevWPM));
        ctx.lineTo(189, (ctx.canvas.height - netWPM));
    }
    else if(chars.length - charCounter <= 10 && chars.length > 200){
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo((199 - (chars.length - charCounter)), (ctx.canvas.height - netWPM));
        ctx.lineTo((200 - (chars.length - charCounter)), (ctx.canvas.height - netWPM));
    }
    else{
        ctx.lineTo((charCounter - 1), (ctx.canvas.height - netWPM));
    }
    ctx.stroke();
}

//Försöka implementera på bättre sätt
function WPMTimer(){
    setTimeout(() => {
        getWPM();
        getErrorsPercentage();
        if(charCounter < chars.length){
            WPMTimer();
        }
    }, 200);
}

const selector = document.getElementById("text-selector");
const radioBtns = Array.from(document.querySelectorAll(".radio-lng"));
const chkCaseToggle = document.getElementById("case-toggle");
const textarea = document.getElementById("game-textarea");
const textinput = document.getElementById("textinput");
const gameBtn = document.getElementById("game-btn");
const wpmText = document.getElementById("wpm-value");
const netWPMText = document.getElementById("net-wpm-value");
const errorsText = document.getElementById("errors-value");
const errorsPercentageText = document.getElementById("errors-percentage-value");
const selectedTextTitle = document.getElementById("selected-text-title");
const selectedTextInfo = document.getElementById("selected-text-info");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = 200;
ctx.canvas.height = 100;

const muteBtn = document.getElementById("mute");
const buzzAudio = document.getElementById("buzzAudio");

let texts;
let chars;
let char;
let charCounter;
let errorsCounter;
let startTime;
let netWPM;

gameBtn.addEventListener("click", () => {
    if(!gameBtn.classList.contains("stop")){
        startGame();
    } else {
        stopGame();
    }
});

selector.addEventListener("change", () => {
    stopGame();
    clearText();
    fillTextArea();
    fillTextArray();
    setInfoText();
});

for (let i = 0; i < radioBtns.length; i++) {
    const rb = radioBtns[i];
    rb.addEventListener("click", () => {
        stopGame();
        clearTextSelector();
        fillTextSelector();
        clearText();
        fillTextArea();
        fillTextArray();
        setInfoText();
    })
}

chkCaseToggle.addEventListener("click", () => {
    stopGame();
})

textinput.addEventListener("keydown", (event) => {
    let key = event.key;
    if(startTime == null){
        startTime = Date.now();
    }
    if(/^[a-öA-Ö,.:;'!\- ]$/.test(key)){
        if(key == " "){
            textinput.value="";
        }
        markCorrectChar(key);
        charCounter++;
        getWPM();
        getErrorsPercentage()
        if(chars.length > charCounter){
            markActiveChar();
        }
        else{
            char.classList.remove("active-char");
            gameBtn.classList.remove("stop");
            endGame();
        }
    }
})

window.addEventListener("load", onInit(), false);
