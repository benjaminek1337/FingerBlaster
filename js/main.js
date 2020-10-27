
//#region DOM-elements

const selector = document.getElementById("text-selector");
const radioBtns = Array.from(document.querySelectorAll(".radio-lng"));
const chkCaseToggle = document.getElementById("case-toggle");
const textarea = document.getElementById("game-textarea");
const textinput = document.getElementById("textinput");
const gameBtn = document.getElementById("game-btn");
const muteBtn = document.getElementById("mute");
const buzzAudio = document.getElementById("buzzAudio");
const stats = Array.from(document.getElementsByClassName("stat-value"));
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


//#endregion

//#region Variables

let texts; // Array containing texts imported from the JSON file
let chars; // Array of all the individual chars from the text area
let charCounter = 0; // Value of currently active char
let errorsCounter = 0; // Ammount of wrong keystrokes
let startTime; // When the player started typing the first letter
let wpmTimer; // Interval which runs stats calculations/draw graph as game is going
let xAxisCounter = 0; // Value of the graphs x-axis

//#endregion

//#region Event listeners
// Starts/stops game depending on gameBtn class
gameBtn.addEventListener("click", () => {
    if(!gameBtn.classList.contains("stop")){
        startGame();
    } else {
        stopGame();
    }
});

// When changing texts from selector
selector.addEventListener("change", () => {
    clearTextArea();
    fillTextArea();
    fillTextArray();
    setInfoText();
});

// On radio btn change
for (let i = 0; i < radioBtns.length; i++) {
    const rb = radioBtns[i];
    rb.addEventListener("click", () => {
        clearTextSelector();
        fillTextSelector();
        clearTextArea();
        fillTextArea();
        fillTextArray();
        setInfoText();
    });
}

// Keyboard input to text input box
textinput.addEventListener("keydown", (event) => {
    let key = event.key;
    evaluateKey(key);
});

//#endregion

// Functions to run when document is loaded
function onInit(){
    loadJSON( (response) => {
        texts = JSON.parse(response); // Fills the texts array from parsed JSON
    });

    fillTextSelector();
    fillTextArea();
    fillTextArray();
    setInfoText();
    initCanvas();
    textinput.disabled = true;
}

// Fetches JSON file and sends it.
function loadJSON(callback){
    const obj = new XMLHttpRequest();
    obj.overrideMimeType("application/json");
    obj.open('GET', 'texts.json', false);
    obj.onreadystatechange = () => {
        if (obj.readyState === 4 && obj.status === 200) {
            callback(obj.responseText);
        }
    };
    obj.send();  
}

// Fills the text selector with titles, and filters them depending on selected lng
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

// Fills the textarea with the text prop from the texts array
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

// Gets the span elements from the textarea and shove 'em into an array
function fillTextArray(){
    chars = Array.from(textarea.querySelectorAll("span"));
}

// Gets the DOM-elements regarding author, and text stats. Calculates and sets info to them
function setInfoText(){
    const selectedTextTitle = document.getElementById("selected-text-title");
    const selectedTextInfo = document.getElementById("selected-text-info");
    const text = texts.find(t => t.title == selector.value);
    const wordCount = text.text.split(" ").length;
    selectedTextTitle.innerHTML = text.title;
    selectedTextInfo.innerHTML = text.author + " (" + wordCount + " ord, " + 
    chars.length + " tecken)"
}

// Function to run on game start
function startGame(){
    if(charCounter !== 0){
        // If charCounter != 0, risk for garbage values somewhere
        resetCounters();
        resetLetters();
        startTime = null;
    }
    markActiveChar();
    gameBtn.classList.add("stop"); // Adds "stop" class to gameBtn
    toggleEnabledDisabledAreas(false); // Disables/enables DOM-elements
    textinput.focus();
    setWPMtext("--", "--", "0", "100%"); // Sends default values to the stats area
    ctx.canvas.width = ctx.canvas.width; // Removes the graph line from canvas
    ctx.moveTo(-1,100); // Moves the canvas starting point 
}

// Function to run on game end
function endGame(){
    clearWPMInterval();
    gameBtn.classList.remove("stop");
    startTime = null;
    xAxisCounter = 0;
    toggleEnabledDisabledAreas(true); // Disables/enables DOM-elements
    textinput.blur();
}

// Function to run on game abort
function stopGame(){
    endGame();
    setWPMtext("", "", "", "") // Clears stats area
    resetCounters();
    resetLetters();
    ctx.canvas.width = ctx.canvas.width; // Removes the graph line from canvas
}

// Recieves key stroke, evaluates it, perform actions depending on key value
function evaluateKey(key){
    //This runs when function revieves its first keystroke per game
    if(startTime == null){
        startTime = Date.now();
        setWPMInterval(); // Starts the interval timer for stats calc
    }
    // If the stroke string contains one char (Not "Backspace", "Shift", etc)
    if(key.length === 1){
        // If blank space
        if(key == " "){
            textinput.value=""; // Clear textinput of chars
        }
        markCorrectChar(key);
        // As long as there's chars to evaluate
        if(chars.length > charCounter){
            markActiveChar();
        }
        // When out of chars to evaluate
        else{
            chars[charCounter - 1].classList.remove("active-char"); // Removes highlighter from char
            endGame();
        }
    } 
    // On backspace
    else if(key === "Backspace" && charCounter > 0){
       correctError();
    }
}

// Clears charCounter and errorCounter
function resetCounters(){
    charCounter = 0;
    errorsCounter = 0;
}

// Clears the textareas span elements of all classes
function resetLetters(){
    if(chars.length > 0){
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            char.className = "";
        }
    }
}

// Enables/disables DOM-elements depending on recieved boolean value
function toggleEnabledDisabledAreas(toggler){
    const settingsDiv = document.getElementById("settings");
    textinput.disabled = toggler;
    textinput.value = "";

    selector.disabled = !toggler;
    chkCaseToggle.disabled = !toggler;
    for (let i = 0; i < radioBtns.length; i++) {
        radioBtns[i].disabled = !toggler;
    }
    if(!toggler)
        settingsDiv.classList.add("on-disable");
    else
    settingsDiv.classList.remove("on-disable");

}

// Clears the text selector
function clearTextSelector(){
    for (let i = selector.options.length - 1; i >= 0; i--){
        selector.options[i] = null;
    }
}

// Clears the text area
function clearTextArea(){
    textarea.innerHTML="";
}

// Highlights the current active char, removes highlight from previous char
function markActiveChar(){
    if(chars[charCounter].id !== "0"){
        const previousChar = chars.find(c => c.id == chars[charCounter].id - 1);
        previousChar.classList.remove("active-char");
    }
    chars[charCounter].classList.add("active-char");
}

// Evaluates recieved char to currently active char. Marks char as correct or incorrect with classes
// Runs function to play error sound if enabled and increments error counter on mistake
function markCorrectChar(key){
    if(chkCaseToggle.checked && chars[charCounter].innerHTML.toLowerCase() === key.toLowerCase()){
        chars[charCounter].classList.add("correct-char");
    }
    else if(chars[charCounter].innerHTML === key){
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

// Jumps the active character backwards, clears all classes from previously typed char
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

// Plays sound effect buzzAudio
function playErrorSound(){
    buzzAudio.play();
}

// Returns timestamp from gamestart to time of functionrun
function getElapsedTime(){
    return (Date.now() - startTime) / 60000;
}

// Calculates and returns gross WPM
function getGrossWPM(){
    return Math.round((charCounter / 5) / getElapsedTime());
}

// Calculates and returns net WPM
function getNetWPM(){
    return Math.round(getGrossWPM() - (( errorsCounter / 5) / getElapsedTime()));
}

// Calculates percentage of type accuracy
function getErrorsPercentage(){
    let percent;
    if(errorsCounter === 0){
        percent = 100;
    } else {
        percent = Math.round(100 - ((errorsCounter * 100) / charCounter));
    }
    return percent;
}

// Recieves values, sets values to DOM-elements representing typing stats
function setWPMtext(grossWPM, netWPM, errorsCount, percentage){
    stats[0].innerHTML = grossWPM;
    stats[1].innerHTML = netWPM;
    stats[2].innerHTML = errorsCount;
    stats[3].innerHTML = percentage;
}

// Sets height/width of canvas
function initCanvas(){
    ctx.canvas.width = 200;
    ctx.canvas.height = 100;
}

// Function to draw WPM graph on the canvas
function drawCanvas(){
    ctx.strokeStyle = "#ff5cf1"; // The color of the line
    // Saves an image of the current graph, clears graph, puts image -1 x value to simulate
    // a continually scrolling graph when the graph line is nearing max width of graph
    if(xAxisCounter > (ctx.canvas.width - 10)){
        const imageData = ctx.getImageData(1, 0, ctx.canvas.width-1, ctx.canvas.height);
        ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
        ctx.putImageData(imageData, 0, 0);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo((ctx.canvas.width - 12), (ctx.canvas.height - getNetWPM()));
        ctx.lineTo((ctx.canvas.width - 11), (ctx.canvas.height - getNetWPM()));
    }
    // Draws graph according to net WPM and the x axis counter
    else{
        ctx.lineWidth = 1.1;
        ctx.lineTo((xAxisCounter - 1), (ctx.canvas.height - getNetWPM()));
        xAxisCounter++;
    }
    // Does the drawing
    ctx.stroke();
}

// Function to set wpmTimer to run stat functions on a predefined interval, here 100 ms
function setWPMInterval(){
    wpmTimer = setInterval(() => {
        setWPMtext(getGrossWPM(), getNetWPM(), errorsCounter, getErrorsPercentage()  + "%");
        drawCanvas();
    }, 100);
}

// Clears the wpmTimer
function clearWPMInterval(){
    clearInterval(wpmTimer);
}

// Event listener to on window load
window.addEventListener("load", onInit(), false);
