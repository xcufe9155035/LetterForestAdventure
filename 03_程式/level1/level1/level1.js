/* =========================================================
   第一關整合版：1-1～1-5 + 結束頁
   重點：同一個 HTML 內切換 stage，背景音樂不會重新載入
========================================================= */

const bgm = document.getElementById("bgm");
bgm.volume = 0.25;

let currentStage = "stage1";
let endingTimerStarted = false;
const AI_URL = "/api/ai";

function showStage(stageNumber){
    const targetId = stageNumber === "ending" ? "stageEnding" : "stage" + stageNumber;

    document.querySelectorAll(".stage").forEach(stage=>{
        stage.classList.remove("active");
    });

    const target = document.getElementById(targetId);
    if(target){
        target.classList.add("active");
        currentStage = targetId;
    }

    if(targetId === "stageEnding"){
        startEndingPage();
    }
}

/* 第一次點擊後播放音樂：瀏覽器規定一定要有互動才可播放 */
document.addEventListener("click", () => {
    bgm.play().catch(()=>{});
}, { once:true });

/* =========================================================
   紀錄資料到 Google Sheet
========================================================= */

async function sendLog(logData){

    try{

        const payload = {

            name: localStorage.getItem("playerId"),

            email: localStorage.getItem("playerEmail"),

            log: typeof logData === "object"
                ? JSON.stringify(logData)
                : logData

        };

        const response = await fetch(
            "/api/log",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(payload)
            }
        );

        const result = await response.json();

        console.log("log result:",result);

        return result.status === "success";

    }catch(error){

        console.error("sendLog error:",error);

        return false;

    }

}

/* =========================================================
   1-1 月光湖：Aa-Ff
========================================================= */
function initStage1(){
    const lakeClick = document.getElementById("lakeClick");
    const gameModal = document.getElementById("gameModal");
    const closeBtn = document.getElementById("closeBtn");
    const leftBox = document.querySelector("#stage1 .left");
    const rightBox = document.querySelector("#stage1 .right");
    const slots = document.querySelectorAll("#stage1 .slot");
    const energy = document.querySelector("#stage1 .energy");

    let firstLetter = null;
    let secondLetter = null;
    let waiting = false;
    let score = 0;

    const pairColors = {
        a:"#ffe066",
        b:"#8b5cf6",
        c:"#6bd34f",
        d:"#38aeea",
        e:"#ec6ab7",
        f:"#b8c7d6"
    };

    lakeClick.addEventListener("click",()=>{
        gameModal.classList.remove("hidden");
        resetGame();
        shuffleLetters();
    });

    closeBtn.addEventListener("click",()=>{
        gameModal.classList.add("hidden");
        clearPick();
    });

    bindLetters();

    function bindLetters(){
        const letters = document.querySelectorAll("#stage1 .letter");

        letters.forEach(letter=>{
            letter.onclick = ()=>{
                if(waiting) return;
                if(letter.classList.contains("matched")) return;
                if(letter===firstLetter) return;

                letter.classList.add("selected");

                if(firstLetter===null){
                    firstLetter = letter;
                    return;
                }

                secondLetter = letter;
                checkMatch();
            };
        });
    }

    function checkMatch(){
        waiting = true;

        const firstValue = firstLetter.textContent.trim().toLowerCase();
        const secondValue = secondLetter.textContent.trim().toLowerCase();

        if(firstValue === secondValue){
            const color = pairColors[firstValue];

            setTimeout(()=>{
                paintLetter(firstLetter,color);
                paintLetter(secondLetter,color);

                firstLetter.classList.add("matched");
                secondLetter.classList.add("matched");
                firstLetter.disabled = true;
                secondLetter.disabled = true;

                score++;
                updateCollection(score,color);
                clearPick();

                if(score>=6){
                    setTimeout(()=>{
                        gameModal.classList.add("hidden");
                        showStage(2);
                    },1500);
                }
            },250);
        }
        else{
            setTimeout(()=>{
                firstLetter.classList.remove("selected");
                secondLetter.classList.remove("selected");
                clearPick();
            },700);
        }
    }

    function paintLetter(letter,color){
        letter.style.setProperty("background",color,"important");
        letter.style.setProperty("background-color",color,"important");
        letter.style.setProperty("box-shadow",`0 0 28px ${color}`,"important");
        letter.style.setProperty("color","#ffffff","important");
    }

    function updateCollection(score,color){
        energy.textContent = `⭐ ${score} / 6`;
        const slot = slots[score-1];

        if(slot){
            slot.style.opacity = "1";
            slot.style.transform = "scale(1.05)";
            slot.style.filter = "brightness(1.1) drop-shadow(0 0 8px rgba(255,255,220,0.55))";
            slot.style.boxShadow = `0 0 12px ${color}`;
            slot.style.border = `2px solid ${color}`;
            slot.style.background = "";
        }
    }

    function clearPick(){
        firstLetter = null;
        secondLetter = null;
        waiting = false;

        document.querySelectorAll("#stage1 .letter").forEach(letter=>{
            if(!letter.classList.contains("matched")){
                letter.classList.remove("selected");
            }
        });
    }

    function resetGame(){
        score = 0;
        waiting = false;
        firstLetter = null;
        secondLetter = null;
        energy.textContent = "⭐ 0 / 6";

        document.querySelectorAll("#stage1 .letter").forEach(letter=>{
            letter.disabled = false;
            letter.classList.remove("matched","selected");
            letter.style.removeProperty("background");
            letter.style.removeProperty("background-color");
            letter.style.removeProperty("box-shadow");
            letter.style.removeProperty("color");
        });

        slots.forEach(slot=>{
            slot.style.opacity = "";
            slot.style.transform = "";
            slot.style.filter = "";
            slot.style.boxShadow = "";
            slot.style.border = "";
            slot.style.background = "";
        });
    }

    function shuffleLetters(){
        shuffleSide(leftBox);
        shuffleSide(rightBox);
    }

    function shuffleSide(box){
        const items = Array.from(box.children);

        for(let i=items.length-1;i>0;i--){
            const j = Math.floor(Math.random()*(i+1));
            [items[i],items[j]] = [items[j],items[i]];
        }

        items.forEach(item=>box.appendChild(item));
    }
}

/* =========================================================
   1-2 湖底泡泡：Gg-Kk
========================================================= */
function initStage2(){
    const stage = document.getElementById("level1-2");
    const bubbles = document.querySelectorAll("#stage2 .letter-bubble");
    const mission = document.getElementById("mission-box");

    const finish = document.createElement("div");
    finish.id = "finish-message";
    finish.innerText = "🫧 湖底的泡泡回家了 🫧";
    stage.appendChild(finish);

    let firstBubble = null;
    let matchedCount = 0;
    const totalPairs = 5;
    const used = [];
    let missionHidden = false;

    const homeSlots = {
        g:{upper:{left:18,top:8},lower:{left:28,top:8}},
        h:{upper:{left:38,top:8},lower:{left:48,top:8}},
        i:{upper:{left:58,top:8},lower:{left:68,top:8}},
        j:{upper:{left:24,top:22},lower:{left:34,top:22}},
        k:{upper:{left:54,top:22},lower:{left:64,top:22}}
    };

    stage.addEventListener("click",()=>{
        if(mission && !missionHidden){
            missionHidden = true;
            mission.classList.add("hide");
        }
    });

    function randomPos(){
        let x;
        let y;
        let safe = false;

        while(!safe){
            x = Math.random()*75+10;
            y = Math.random()*55+25;
            safe = true;

            for(let p of used){
                let dx = p.x-x;
                let dy = p.y-y;
                let dis = Math.sqrt(dx*dx+dy*dy);

                if(dis<14){
                    safe = false;
                    break;
                }
            }
        }

        used.push({x:x,y:y});
        return {x:x,y:y};
    }

    bubbles.forEach(bubble=>{
        let p = randomPos();
        bubble.style.left = p.x+"%";
        bubble.style.top = p.y+"%";
    });

    bubbles.forEach(bubble=>{
        bubble.addEventListener("click",()=>{
            if(bubble.classList.contains("matched")) return;
            if(firstBubble===bubble) return;

            bubble.classList.add("selected");

            if(firstBubble===null){
                firstBubble = bubble;
                return;
            }

            let a = firstBubble.dataset.letter;
            let b = bubble.dataset.letter;

            if(a===b){
                let pair = a;
                let upperBubble;
                let lowerBubble;

                if(firstBubble.textContent === firstBubble.textContent.toUpperCase()){
                    upperBubble = firstBubble;
                    lowerBubble = bubble;
                }
                else{
                    upperBubble = bubble;
                    lowerBubble = firstBubble;
                }

                upperBubble.style.left = homeSlots[pair].upper.left + "%";
                upperBubble.style.top = homeSlots[pair].upper.top + "%";
                lowerBubble.style.left = homeSlots[pair].lower.left + "%";
                lowerBubble.style.top = homeSlots[pair].lower.top + "%";

                upperBubble.style.transform = "scale(.8)";
                lowerBubble.style.transform = "scale(.8)";
                upperBubble.classList.add("matched");
                lowerBubble.classList.add("matched");
                upperBubble.classList.remove("selected");
                lowerBubble.classList.remove("selected");

                matchedCount++;
                firstBubble = null;

                if(matchedCount===totalPairs){
                    stage.classList.add("finish");

                    setTimeout(()=>{
                        finish.classList.add("show");
                    },800);

                    setTimeout(()=>{
                        showStage(3);
                    },4000);
                }
            }
            else{
                let w1 = firstBubble;
                let w2 = bubble;

                setTimeout(()=>{
                    w1.classList.remove("selected");
                    w2.classList.remove("selected");
                    firstBubble = null;
                },600);
            }
        });
    });
}

/* =========================================================
   1-3 漂流木：Ll-Pp
========================================================= */
function initStage3(){
    const stage3 = document.getElementById("stage3");
    const storyOverlay = document.getElementById("storyOverlay");
    const matchWindow = document.getElementById("matchWindow");
    const moonPuzzle = document.getElementById("moonPuzzle");
    const game = document.querySelector("#stage3 .game");
    const smallLetter = document.querySelector("#stage3 .small-letter");
    const choiceButtons = document.querySelectorAll("#stage3 .choice-row button");
    const matchTitle = document.querySelector("#stage3 .match-title");

    const hotspotLeft = document.createElement("div");
    const hotspotMiddle = document.createElement("div");
    const hotspotRight = document.createElement("div");

    hotspotLeft.className = "lakeHotspot hotspotLeft";
    hotspotMiddle.className = "lakeHotspot hotspotMiddle";
    hotspotRight.className = "lakeHotspot hotspotRight";
    game.appendChild(hotspotLeft);
    game.appendChild(hotspotMiddle);
    game.appendChild(hotspotRight);

    const hotspots = [hotspotLeft,hotspotMiddle,hotspotRight];
    let correctIndex = Math.floor(Math.random()*3);

    const originalPairs = [
        { upper:"L", lower:"l" },
        { upper:"M", lower:"m" },
        { upper:"N", lower:"n" },
        { upper:"O", lower:"o" },
        { upper:"P", lower:"p" }
    ];

    let pairs = [];
    let currentPairIndex = 0;
    let currentAnswer = "";
    let hintIndex = 0;
    let collectedCount = 0;
    let collectStarted = false;
    let storyHidden = false;

    function shuffleArray(arr){
        for(let i=arr.length-1;i>0;i--){
            const j = Math.floor(Math.random()*(i+1));
            [arr[i],arr[j]] = [arr[j],arr[i]];
        }
        return arr;
    }

    function randomizeWoodPieces(){
        const woodPieces = document.querySelectorAll("#stage3 .wood-piece");
        const safePositions = [
            { left:8, top:32, rotate:-22 },
            { left:30, top:24, rotate:16 },
            { left:55, top:38, rotate:-10 },
            { left:74, top:28, rotate:12 },
            { left:88, top:62, rotate:-18 },
            { left:15, top:58, rotate:20 },
            { left:42, top:52, rotate:-14 },
            { left:67, top:60, rotate:18 },
            { left:92, top:42, rotate:-8 },
            { left:36, top:72, rotate:10 }
        ];

        const shuffledPositions = shuffleArray([...safePositions]);

        woodPieces.forEach((piece,index)=>{
            const position = shuffledPositions[index];
            piece.style.left = position.left + "%";
            piece.style.top = position.top + "%";
            piece.style.transform = `rotate(${position.rotate}deg)`;
        });
    }

    randomizeWoodPieces();

    hotspots.forEach(item=>{
        item.classList.add("active");
        item.style.pointerEvents = "auto";
    });

    function hideStoryOverlay(){
        if(storyHidden) return;
        storyHidden = true;
        storyOverlay.classList.add("hideStory");
        storyOverlay.style.pointerEvents = "none";

        setTimeout(()=>{
            storyOverlay.style.display = "none";
        },900);
    }

    function showHint(target,index){
        const smoke = document.createElement("div");
        smoke.className = "smokeEffect";

        const bubble = document.createElement("div");
        if(index===0){
            bubble.className = "thoughtBubble bubble-left";
        }
        else if(index===2){
            bubble.className = "thoughtBubble bubble-right";
        }
        else{
            bubble.className = "thoughtBubble bubble-middle";
        }

        const messages = [
            `「它沒有醒來……」<br>也許，還有別的漂流木正在等你。`,
            `湖水輕輕晃了一下。<br>像是有人小聲提醒：<br>「再找找看。」`
        ];

        bubble.innerHTML = messages[hintIndex];
        hintIndex++;
        if(hintIndex>=messages.length) hintIndex = 0;

        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width/2;
        const woodTop = rect.top + 20;

        smoke.style.left = centerX + "px";
        smoke.style.top = woodTop + "px";
        bubble.style.left = centerX + "px";
        bubble.style.top = woodTop - 120 + "px";

        stage3.appendChild(smoke);
        setTimeout(()=>stage3.appendChild(bubble),420);
        setTimeout(()=>{
            smoke.remove();
            bubble.remove();
        },3200);
    }

    function closeHotspots(){
        hotspots.forEach(item=>{
            item.classList.remove("active");
            item.style.display = "none";
            item.style.pointerEvents = "none";
        });
    }

    function startMatchGame(){
        if(!moonPuzzle.classList.contains("hidden")) return;
        closeHotspots();
        pairs = shuffleArray([...originalPairs]);
        currentPairIndex = 0;
        showCurrentPair();
        matchWindow.classList.remove("hidden");
        matchWindow.style.display = "flex";
        matchWindow.style.pointerEvents = "auto";
    }

    function showCurrentPair(){
        const current = pairs[currentPairIndex];
        const showUpper = Math.random()<0.5;
        let buttonLetters = [];

        if(showUpper){
            smallLetter.textContent = current.upper;
            currentAnswer = current.lower;
            buttonLetters = ["l","m","n","o","p"];
        }
        else{
            smallLetter.textContent = current.lower;
            currentAnswer = current.upper;
            buttonLetters = ["L","M","N","O","P"];
        }

        buttonLetters = shuffleArray(buttonLetters);

        choiceButtons.forEach((button,index)=>{
            button.textContent = buttonLetters[index];
            button.disabled = false;
            button.style.opacity = "1";
            button.style.transform = "";
        });

        matchTitle.textContent = "漂流木發出了微光……";
    }

    choiceButtons.forEach(button=>{
        button.addEventListener("click",()=>{
            if(button.textContent === currentAnswer){
                button.style.transform = "scale(1.18)";
                button.style.opacity = "0.65";
                currentPairIndex++;

                if(currentPairIndex < pairs.length){
                    setTimeout(()=>showCurrentPair(),500);
                }
                else{
                    setTimeout(()=>{
                        matchTitle.innerText = "太好了！漂流木碎片醒來了，\n接著把藏在湖邊的碎片找回來吧！";
                        smallLetter.textContent = "🌙";
                        choiceButtons.forEach(btn=>{
                            btn.disabled = true;
                            btn.style.opacity = "0";
                        });
                    },500);

                    setTimeout(()=>{
                        matchWindow.classList.add("hidden");
                        matchWindow.style.display = "none";
                        matchWindow.style.pointerEvents = "none";
                        closeHotspots();
                        moonPuzzle.classList.remove("hidden");
                        initFindAndCollect();
                    },3200);
                }
            }
            else{
                button.style.transform = "translateY(4px) scale(0.92)";
                button.style.opacity = "0.45";
                matchTitle.textContent = "漂流木沒有回應，再想想看……";

                setTimeout(()=>{
                    button.style.transform = "";
                    button.style.opacity = "1";
                    matchTitle.textContent = "漂流木發出了微光……";
                },700);
            }
        });
    });

    hotspots.forEach((item,index)=>{
        item.addEventListener("click",()=>{
            hideStoryOverlay();
            if(collectStarted) return;

            if(index===correctIndex){
                startMatchGame();
            }
            else{
                showHint(item,index);
            }
        });
    });

    function initFindAndCollect(){
        if(collectStarted) return;
        collectStarted = true;

        const woodPieces = document.querySelectorAll("#stage3 .wood-piece");

        woodPieces.forEach(piece=>{
            piece.style.display = "block";
            piece.addEventListener("pointerdown",startDragPiece);
            piece.addEventListener("click",()=>{
                piece.classList.add("found");
            });
        });
    }

    function startDragPiece(e){
        const piece = e.currentTarget;
        if(piece.classList.contains("collected")) return;

        piece.classList.add("found");
        piece.setPointerCapture(e.pointerId);
        piece.style.zIndex = "120";
        piece.style.cursor = "grabbing";

        const rect = piece.getBoundingClientRect();
        const shiftX = e.clientX - rect.left;
        const shiftY = e.clientY - rect.top;

        function moveAt(clientX,clientY){
            piece.style.left = clientX - shiftX + "px";
            piece.style.top = clientY - shiftY + "px";
        }

        function onMove(ev){
            moveAt(ev.clientX,ev.clientY);
        }

        function onUp(ev){
            piece.releasePointerCapture(ev.pointerId);
            piece.removeEventListener("pointermove",onMove);
            piece.removeEventListener("pointerup",onUp);
            piece.style.cursor = "grab";
            checkCollect(piece);
        }

        piece.addEventListener("pointermove",onMove);
        piece.addEventListener("pointerup",onUp);
    }

    function checkCollect(piece){
        const moonBox = document.getElementById("moonBox");
        if(!moonBox) return;

        const pieceRect = piece.getBoundingClientRect();
        const boxRect = moonBox.getBoundingClientRect();
        const pieceCenterX = pieceRect.left + pieceRect.width/2;
        const pieceCenterY = pieceRect.top + pieceRect.height/2;

        const insideBox =
            pieceCenterX > boxRect.left &&
            pieceCenterX < boxRect.right &&
            pieceCenterY > boxRect.top &&
            pieceCenterY < boxRect.bottom;

        if(insideBox){
            piece.classList.add("collected");
            collectedCount++;

            const puzzleHint = document.getElementById("puzzleHint");

            if(collectedCount < 5 && puzzleHint){
                puzzleHint.innerHTML = `很好！<br>已經找回 ${collectedCount} 塊漂流木了。`;
            }

            if(collectedCount===5){
                finishPuzzle();
            }
        }
        else{
            piece.style.zIndex = "65";
        }
    }

    function finishPuzzle(){
        const puzzleHint = document.getElementById("puzzleHint");
        const moonBox = document.getElementById("moonBox");

        if(puzzleHint){
            puzzleHint.innerHTML = "月亮恢復了。<br>湖面重新映出了月光。";
        }

        if(moonBox){
            moonBox.classList.add("complete");
        }

        setTimeout(()=>{
            showStage(4);
        },3500);
    }
}

/* =========================================================
   1-4 月光碎片：Qq-Tt
========================================================= */
function initStage4(){
    const shardData = ["Q","q","R","r","S","s","T","t"];
    const stage4 = document.getElementById("stage4");
    const shardArea = document.getElementById("shard-area");
    const instructionBox = document.querySelector("#stage4 .instruction-box");
    const message = document.getElementById("message");

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let gameStarted = false;
    let matchedCount = 0;

    stage4.addEventListener("click",startGame,{ once:true });

    function startGame(){
        if(gameStarted) return;
        gameStarted = true;
        instructionBox.classList.add("hide");

        setTimeout(()=>{
            createShards();
        },700);
    }

    function createShards(){
        const shuffled = [...shardData].sort(()=>Math.random()-0.5);
        const positions = createAreaPositions();

        shuffled.forEach((letter,index)=>{
            const card = document.createElement("div");
            card.className = "moon-shard";
            card.dataset.letter = letter;

            const pos = positions[index];
            card.style.left = pos.left + "%";
            card.style.top = pos.top + "%";
            card.addEventListener("click",flipCard);
            shardArea.appendChild(card);
        });
    }

    function createAreaPositions(){
        const areas = [
            { count:3, leftMin:10, leftMax:26, topMin:18, topMax:50 },
            { count:3, leftMin:70, leftMax:86, topMin:18, topMax:50 },
            { count:2, leftMin:42, leftMax:64, topMin:62, topMax:76 }
        ];

        const positions = [];

        areas.forEach(area=>{
            for(let i=0;i<area.count;i++){
                let pos;
                let valid = false;
                let tries = 0;

                while(!valid && tries<200){
                    pos = {
                        left:randomBetween(area.leftMin,area.leftMax),
                        top:randomBetween(area.topMin,area.topMax)
                    };

                    valid = true;

                    for(const existing of positions){
                        const dx = pos.left - existing.left;
                        const dy = pos.top - existing.top;
                        const distance = Math.sqrt(dx*dx+dy*dy);

                        if(distance<11){
                            valid = false;
                            break;
                        }
                    }

                    tries++;
                }

                positions.push(pos);
            }
        });

        return positions.sort(()=>Math.random()-0.5);
    }

    function randomBetween(min,max){
        return min + Math.random()*(max-min);
    }

    function flipCard(event){
        event.stopPropagation();
        if(lockBoard) return;
        if(this.classList.contains("collected")) return;
        if(this===firstCard) return;

        this.textContent = this.dataset.letter;
        this.classList.add("open");

        if(!firstCard){
            firstCard = this;
            return;
        }

        secondCard = this;
        checkMatch();
    }

    function checkMatch(){
        const a = firstCard.dataset.letter;
        const b = secondCard.dataset.letter;

        const success = a.toLowerCase()===b.toLowerCase() && a!==b;

        if(success){
            collectPair();
        }
        else{
            lockBoard = true;

            setTimeout(()=>{
                firstCard.textContent = "";
                secondCard.textContent = "";
                firstCard.classList.remove("open");
                secondCard.classList.remove("open");
                resetTurn();
            },900);
        }
    }

    function collectPair(){
        lockBoard = true;
        flyToMoon(firstCard);
        flyToMoon(secondCard);
        firstCard.classList.add("collected");
        secondCard.classList.add("collected");
        matchedCount++;

        setTimeout(()=>{
            firstCard.remove();
            secondCard.remove();
            resetTurn();

            if(matchedCount===4){
                finishGame();
            }
        },950);
    }

    function flyToMoon(card){
        const cardRect = card.getBoundingClientRect();
        const moonX = window.innerWidth*0.52;
        const moonY = window.innerHeight*0.25;
        const cardX = cardRect.left + cardRect.width/2;
        const cardY = cardRect.top + cardRect.height/2;
        const flyX = moonX - cardX;
        const flyY = moonY - cardY;

        card.style.setProperty("--fly-x",flyX+"px");
        card.style.setProperty("--fly-y",flyY+"px");
    }

    function finishGame(){
        message.style.display = "block";
        message.textContent = "月光重新聚集";

        setTimeout(()=>{
            showStage(5);
        },5000);
    }

    function resetTurn(){
        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }
}

/* =========================================================
   1-5 星石召喚：Uu-Zz
========================================================= */
function initStage5(){
    const pairs = [
        { upper:"U", lower:"u" },
        { upper:"V", lower:"v" },
        { upper:"W", lower:"w" },
        { upper:"X", lower:"x" },
        { upper:"Y", lower:"y" },
        { upper:"Z", lower:"z" }
    ];

    const startBtn = document.getElementById("start-summon-btn");
    const modalOverlay = document.getElementById("modal-overlay");
    const letterButtons = document.querySelectorAll("#stage5 .summon-letter");
    const completeMessage = document.getElementById("complete-message");
    const gameContainer = document.getElementById("game-container");
    const finalStar = document.getElementById("final-star");

    let selectedUpper = null;
    let matchedCount = 0;

    function shuffle(array){
        return array.sort(()=>Math.random()-0.5);
    }

    function startGame(){
        startBtn.style.display = "none";
        modalOverlay.classList.add("show");
        setupLetters();
    }

    function setupLetters(){
        selectedUpper = null;
        matchedCount = 0;
        const letters = [];

        pairs.forEach(pair=>{
            letters.push({ text:pair.upper, type:"upper", match:pair.lower });
            letters.push({ text:pair.lower, type:"lower", match:pair.upper });
        });

        const shuffledLetters = shuffle(letters);

        letterButtons.forEach((button,index)=>{
            const letter = shuffledLetters[index];
            button.textContent = letter.text;
            button.dataset.type = letter.type;
            button.dataset.match = letter.match;
            button.dataset.text = letter.text;
            button.className = "summon-letter";
            button.style.pointerEvents = "auto";
        });
    }

    letterButtons.forEach(button=>{
        button.addEventListener("click",()=>{
            if(button.classList.contains("correct")) return;
            const type = button.dataset.type;

            if(type==="upper"){
                letterButtons.forEach(btn=>btn.classList.remove("selected"));
                button.classList.add("selected");
                selectedUpper = button;
                return;
            }

            if(type==="lower"){
                if(!selectedUpper){
                    showWrong(button);
                    return;
                }

                const isCorrect =
                    selectedUpper.dataset.text === button.dataset.match &&
                    button.dataset.text === selectedUpper.dataset.match;

                if(isCorrect){
                    selectedUpper.classList.remove("selected");
                    selectedUpper.classList.add("correct");
                    button.classList.add("correct");
                    selectedUpper.style.pointerEvents = "none";
                    button.style.pointerEvents = "none";
                    matchedCount++;
                    selectedUpper = null;

                    if(matchedCount===pairs.length){
                        setTimeout(finishLevel,800);
                    }
                    return;
                }

                showWrong(selectedUpper);
                showWrong(button);
                selectedUpper.classList.remove("selected");
                selectedUpper = null;
            }
        });
    });

    function showWrong(element){
        element.classList.add("wrong");
        setTimeout(()=>{
            element.classList.remove("wrong");
        },350);
    }

    function finishLevel(){
        modalOverlay.classList.remove("show");
        setTimeout(()=>{
            lightUpBackgroundStones();
        },600);
    }

    function lightUpBackgroundStones(){
        const stonePositions = [
            { left:"50%", top:"34%" },
            { left:"66%", top:"38%" },
            { left:"68%", top:"59%" },
            { left:"50%", top:"68%" },
            { left:"32%", top:"59%" },
            { left:"34%", top:"39%" }
        ];

        stonePositions.forEach((pos,index)=>{
            const glow = document.createElement("div");
            glow.className = "bg-stone-glow";
            glow.style.left = pos.left;
            glow.style.top = pos.top;
            glow.style.transform = "translate(-50%,-50%) scale(.4)";
            gameContainer.appendChild(glow);

            setTimeout(()=>{
                glow.classList.add("show");
            },index*300);
        });

        setTimeout(showAltarBurst,2100);
    }

    function showAltarBurst(){
        const altarBurst = document.createElement("div");
        altarBurst.id = "altar-burst";
        gameContainer.appendChild(altarBurst);

        setTimeout(()=>{
            altarBurst.classList.add("show");
        },50);

        setTimeout(()=>{
            finalStar.classList.add("show");
        },800);

        setTimeout(()=>{
            finalStar.classList.add("float");
        },3300);

        setTimeout(()=>{
            completeMessage.classList.add("show");
        },2500);

        setTimeout(async ()=>{
            await sendLog({
                event:"level1_complete"
            });

            showStage("ending");
        },5500);
    }

    startBtn.addEventListener("click",startGame);
}

/* =========================================================
   第一關結束頁
========================================================= */
async function startEndingPage(){

    if(endingTimerStarted) return;
    endingTimerStarted = true;

    const nextBtn = document.getElementById("next-chapter-btn");

    const aiBox = document.getElementById("ai-tutor-box");
    const aiTitle = document.getElementById("ai-title");
    const aiFeedback = document.getElementById("ai-feedback");

    nextBtn.style.display = "none";

    aiBox.style.display = "block";

    try{

        const gameData = JSON.parse(
            localStorage.getItem("letterForestGameData")
        ) || {
            level1Wrong:0,
            level2Wrong:0,
            level3Wrong:0,
            level4Wrong:0
        };

        const AI_URL = "/api/ai";
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(gameData)
            }
        );

        const result = await response.json();

        console.log("AI result:", result);

        aiTitle.innerHTML = "🦉 AI魔法導師的建議";

        aiFeedback.innerHTML =
            result.reply ||
            "你今天的表現很棒！繼續努力喔！";

}catch(error){

    console.error("AI ERROR:", error);

    aiTitle.innerHTML = "🦉 AI魔法導師";

    aiFeedback.innerHTML =
        error.message || "魔法訊息暫時無法傳送";
}

    setTimeout(()=>{

        nextBtn.style.display = "inline-block";

        nextBtn.classList.add("show");

    },3000);

    nextBtn.addEventListener("click",()=>{

        localStorage.removeItem("level1BgmTime");

        window.location.href =
            "../level2/level2.html";

    });

}

/* =========================================================
   啟動全部小關卡
========================================================= */
document.addEventListener("DOMContentLoaded",async ()=>{

    await sendLog({
        event:"level1_start"
    });

    initStage1();
    initStage2();
    initStage3();
    initStage4();
    initStage5();

});