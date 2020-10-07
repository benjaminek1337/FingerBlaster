window.onload = function (){
    
    function onInit(){
        fillTextArea(); //Relik från tidigare. Ersätt mot aktiv text i listan
        fillTextArray();
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
        resetCounters()
        resetLetters();
        markActiveChar();
        startTime = null;
        textinput.disabled = false;
        textinput.focus();

        wpmText.innerHTML ="Total WPM: --";
        netWPMText.innerHTML ="Justerad WPM: --";
        errorsText.innerHTML = "Antal fel: 0";
        errorsPercentageText.innerHTML = "Träffsäkerhet: 100%";
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
    }

    function resetCounters(){
        charCounter = 0;
        errorsCounter = 0;
    }

    function resetLetters(){
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            char.className = "";
        }
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
        if(char.innerHTML == key){
            char.classList.add("correct-char");
        } else {
            char.classList.add("incorrect-char");
            errorsCounter++;
            setNrOfErrorsText();
            //FEL JÄVLA LOSER-ljud
        }
    }

    function getWPM(){
        let currentTime = Date.now();
        let elapsedTime = (currentTime - startTime) / 60000;
        let grossWPM = (charCounter / 5) / elapsedTime;
        let netWPM = grossWPM - (( errorsCounter / 5) / elapsedTime);
        setWPMtext(grossWPM, netWPM);
    }

    function setWPMtext(grossWPM, netWPM){
        wpmText.innerHTML ="Total WPM: " + Math.round(grossWPM);
        netWPMText.innerHTML ="Justerad WPM: " + Math.round(netWPM);
    }

    function setNrOfErrorsText(){
        errorsText.innerHTML = "Antal fel: " + errorsCounter;
    }

    function setErrorsPercentageText(){
        let percent = (errorsCounter * 100) / charCounter;
        errorsPercentageText.innerHTML = "Träffsäkerhet: " + Math.round(100 - percent) + "%" 
    }

    const textarea = document.getElementById("game-textarea");
    const textinput = document.getElementById("textinput");
    const gameBtn = document.getElementById("game-btn");
    const wpmText = document.getElementById("wpm-text");
    const netWPMText = document.getElementById("net-wpm-text");
    const errorsText = document.getElementById("errors-text");
    const errorsPercentageText = document.getElementById("errors-percentage-text");
    let chars;
    let char;
    let charCounter;
    let errorsCounter;
    let startTime;
    let inputString = "Detta ska ju ersättas med massa text från en XMLfil";

    gameBtn.addEventListener("click", function(){
        if(!gameBtn.classList.contains("stop")){
            startGame();
            gameBtn.classList.add("stop");
        } else {
            stopGame();
            gameBtn.classList.remove("stop");
        }
    })

    textinput.addEventListener("keydown", function(event){
        let key = event.key;
        if(startTime == null){
            startTime = Date.now();
        }
        if(/^[a-öA-Ö,.; ]$/.test(key)){
            if(key == " "){
                textinput.value="";
            }
            markCorrectChar(key);
            charCounter++;
            getWPM();
            setErrorsPercentageText()
            if(chars.length > charCounter){
                markActiveChar();
            }
            else{
                //pling DU ÄR KLAR ljud
                char.classList.remove("active-char");
                gameBtn.classList.remove("stop");
                endGame();
            }
        }
    })

    window.addEventListener("load", onInit(), false);
}