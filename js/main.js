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
    }

    function getPreviousChar(){
        let previousChar = chars.find(c => c.id == char.id - 1);
        return previousChar;
    }

    function markActiveChar(){
        char = chars.find(c => c.id == counter);
        if(char.id != 0){
            getPreviousChar().classList.remove("active-char");
        }
        char.classList.add("active-char");
    }

    function markCorrectChar(key){
        if(char.innerHTML == key){
            char.classList.add("correct-char");
        } else {
            char.classList.add("incorrect-char");
        }

    }

    var textarea = document.getElementById("game-textarea");
    var textinput = document.getElementById("textinput");
    var startGameBtn = document.getElementById("start-game-btn");
    var endGameBtn = document.getElementById("end-game-btn");
    let chars;
    var counter = 0;
    var char;
    var inputString = "Dä Börja likna nått nu";

    startGameBtn.addEventListener("click", function(){
        startGame();
    })
    endGameBtn.addEventListener("click", function(){
        endGame();
    });
    textinput.addEventListener("keydown", function(event){
        var key = event.key;
        if(key == " "){
            textinput.value="";
        }
        if(key != "Shift"){
            markCorrectChar(key);
            counter++;
            markActiveChar();
        }

    })

    window.addEventListener("load", onInit(), false);
}