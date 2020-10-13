# Projektuppgift
## Environment & Tools / Utvecklingsmiljö & Verktyg
Windows 10, Visual Studio Code, Git version: 2.28.0.windows.1
## Purpose / Syfte
Perspective: What does the laboration aim to accomplish?
Should specify concrete goal(s) which will enable some discussion and analysis.

Syftet med uppgiften är att utmana mig. Fysiskt samt mentalt.

## Procedures / Genomförande
Steg under utvecklingsprocessen

- Skapa projektets filstruktur med mappar och filer

- Skapa enkel HTML, strukturerad i enighet med kravspecifikation och innehållandes grundläggande element för manipulering i JS. Just nu, område där text ska visas, samt textinput

- Skriva funktionalitet för att ta emot en sträng text, stycka upp alla tecken från strängen till individuella spans, lägga dessa in i en div och dessutom fylla en array med tecknena.

- Skriva funktionalitet för att jämföra de inmatade tecknen i textinput med vad som visas i textrutan. Detta genom att hålla räkningen på hur många tecken som inmatats för att kunna avgöra vilket tecken i följden som ska utvärderas. Aktivt tecken (det som ska fyllas i) blir highlightat, och vid inmatning kontrolleras det om tecknet är korrekt eller inte, och färgsätts därefter. Körs vid varje inmatning till textinput.

- Skapa kontroll för om det är ett korrekt tecken som inmatats till textinput.

- Skriva funktionalitet för att beräkna statistiken. Ord i minuten, justerad ord i minuten, antal fel samt träffsäkerhet i procent. Funktioner med lite olika beräkningar baserade på en timestamp från när första bokstad inmatats, och som körs vid varje inmatning i textinput.

- Ge sidan färg och form genom CSS

- Importera google-fonts till mappen fonts

- Lägga till ljudeffekt som hörs vid felinmatning. Ljudfil till mappen audio. Såg även till att ljudet går att muta.

- Omvandla den bifogade texts.xml till text.json. Ladda in JSON-filen till scriptet genom XMLHttpRequest och lägg in i en array med texter.

- Skapa en selector som tar emot titlarna i JSON-filen.

- Skapa radio btns för att filtrera texter i selectorn baserat på valt språk

- Se till att texten som ska skrivas efter, samt information om den texten hamnar i gränssnittet vid val från selectorn. Det utifrån arrayen med texter.

- Skapa funktion för att ignorera gemener/versaler. Detta gjordes genom en checkbox som kontrollerades vid teckeninmatning. Är den checkad omvandlas alla bokstäver till gemener vid kontroll.

- Implementera ett canvas som ritar upp en graf över net WPM statistiken. Även se till att då canvas ej har plats i X-led, förskjuta grafen åt vänster, och ta bort första raden i Y-led allt eftersom nya sträck ritas.

- Säkerställa att fält töms och återställs vid rätt tillfällen för att undvika buggar.

## Discussion / Diskussion
Perspective: Have the purpose been fulfilled? Determine the suitability of the implementation... should
alternative approaches and procedures be considered?
Personal reflections: What did you learn? What did you find to be particularly difficult? Did the exercises
prepare you sufficiently for the challenge? What could be improved in regards to the assignment? Etc.