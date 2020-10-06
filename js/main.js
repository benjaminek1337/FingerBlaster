window.onload = function (){
    
    function onInit(){
        fillTextArea(); //Relik från tidigare. Ersätt mot aktiv text i listan
        fillTextArray();
        endGameBtn.disabled = true;
    }

    function fillTextArea(){
       let span, node;
        for (let i = 0; i < inputString.split("").length; i++) {
            const character = inputString[i];
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

    function startGame(){
        textinput.disabled = false;
        textinput.focus();
        markActiveChar();
    }

    function endGame(){
        textinput.disabled = true;
        textinput.value = "";
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            char.className = ""
        }
        counter = 0;
        errros = 0;
    }

    function markActiveChar(){
        char = chars.find(c => c.id == counter);
        if(char.id != 0){
            let previousChar = chars.find(c => c.id == char.id - 1);
            previousChar.classList.remove("active-char");
        }
        char.classList.add("active-char");
    }

    function markCorrectChar(key){
        if(char.innerHTML == key){
            char.classList.add("correct-char");
        } else {
            char.classList.add("incorrect-char");
            errors++;
            setNrOfErrorsText();
        }
    }

    function getWPM(){
        let elapsedTime = (currentTime - startTime) / 60000;
        let grossWPM = (counter / 5) / elapsedTime;
        let netWPM = grossWPM - ( errors / 60000);
        let wpmText = document.getElementById("wpm-text");
        let netWPMText = document.getElementById("net-wpm-text");
        wpmText.innerHTML ="Total WPM: " + Math.ceil(grossWPM);
        netWPMText.innerHTML ="Justerad WPM: " + Math.ceil(netWPM);
    }

    function setNrOfErrorsText(){
        let errorsText = document.getElementById("errors-text");
        errorsText.innerHTML = "Antal fel: " + errors;
    }

    var textarea = document.getElementById("game-textarea");
    var textinput = document.getElementById("textinput");
    var startGameBtn = document.getElementById("start-game-btn");
    var endGameBtn = document.getElementById("end-game-btn");
    let chars;
    var char;
    var counter = 0;
    var errors = 0;
    var startTime;
    var currentTime;
    var inputString = "Dä Börja likna nått nu, för nu kommer det en hel " + 
    "jävla blaffa text här som man ska matcha";

    startGameBtn.addEventListener("click", function(){
        startGame();
        startGameBtn.disabled = true;
        endGameBtn.disabled = false;
    })
    endGameBtn.addEventListener("click", function(){
        endGame();
        startGameBtn.disabled = false;
        endGameBtn.disabled = true;
    });
    textinput.addEventListener("keydown", function(event){
        var key = event.key;
        if(startTime == null){
            startTime = Date.now();
            console.log(startTime);
        }
        if(key == " "){
            textinput.value="";
        }
        if(key != "Shift"){
            currentTime = Date.now();
            markCorrectChar(key);
            counter++;
            markActiveChar();
            getWPM();
        }
    })

    window.addEventListener("load", onInit(), false);
}