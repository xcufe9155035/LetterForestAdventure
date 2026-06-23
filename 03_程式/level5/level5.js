const startBtn = document.getElementById("start-btn");
const aiBtn = document.getElementById("ai-btn");

const introScreen = document.getElementById("intro-screen");
const gameScreen = document.getElementById("game-screen");
const completeScreen = document.getElementById("complete-screen");

const questionCount = document.getElementById("question-count");
const questionArea = document.getElementById("question-area");
const optionsArea = document.getElementById("options-area");
const feedback = document.getElementById("feedback");

const bgm = document.getElementById("bgm");

let quizData = [];
let currentQuestion = 0;
let score = 0;

/* ==========================
   API紀錄
========================== */

async function sendLog(logData){

    try{

        const payload = {

            name: localStorage.getItem("playerId"),

            email: localStorage.getItem("playerEmail"),

            log: typeof logData === "object"
                ? JSON.stringify(logData)
                : logData

        };

        await fetch("/api/log",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(payload)
        });

    }catch(error){

        console.error(error);

    }

}

/* ==========================
   載入最終試煉
========================== */

async function loadFinalQuiz(){

    const response = await fetch(
        "/api/final-quiz",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                playerId:
                localStorage.getItem("playerId")
            })
        }
    );

const data = await response.json();

console.log(data);

quizData = data.quiz;

    showQuestion();
}

/* ==========================
   開始
========================== */

startBtn.addEventListener("click",()=>{

    introScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    if(bgm){
        bgm.volume = 0.25;
        bgm.play().catch(()=>{});
    }

    sendLog({
        event:"level5_start"
    });

    loadFinalQuiz();

});

/* ==========================
   顯示題目
========================== */

function showQuestion(){

    feedback.textContent = "";

    optionsArea.innerHTML = "";

    const q = quizData[currentQuestion];

    questionCount.textContent =
        `第 ${currentQuestion+1} / ${quizData.length} 題`;

    if(q.type === "letter_order"){

        questionArea.textContent =
            q.question.join(" ");

    }else if(q.type === "listening_picture"){

        questionArea.textContent =
            `請找出 ${q.word}`;

    }else{

        questionArea.textContent =
            `${q.answer} 和哪個單字有相同開頭音？`;

    }

    q.options.forEach(option=>{

        const btn = document.createElement("button");

        btn.className = "option-btn";

        btn.textContent = option;

        btn.addEventListener("click",()=>{

            checkAnswer(btn,option,q.answer);

        });

        optionsArea.appendChild(btn);

    });

}

/* ==========================
   判斷
========================== */

function checkAnswer(btn,selected,answer){

    const allBtns =
        document.querySelectorAll(".option-btn");

    allBtns.forEach(button=>{

        button.disabled = true;

        if(button.textContent === answer){

            button.classList.add("correct");

        }

    });

    if(selected === answer){

        score++;

        feedback.textContent =
            "答對了！";

    }else{

        btn.classList.add("wrong");

        feedback.textContent =
            `正確答案是 ${answer}`;

    }

    setTimeout(()=>{

        currentQuestion++;

        if(currentQuestion >= quizData.length){

            finishGame();

        }else{

            showQuestion();

        }

    },1500);

}

/* ==========================
   完成
========================== */

function finishGame(){

    gameScreen.classList.add("hidden");

    completeScreen.classList.remove("hidden");

    sendLog({

        event:"level5_complete",

        score:score,

        total:quizData.length

    });

}

/* ==========================
   AI導師
========================== */

aiBtn.addEventListener("click",()=>{

    window.location.href =
    "../ai-report/ai-report.html";

});