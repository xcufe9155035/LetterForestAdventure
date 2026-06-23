const storyBox = document.getElementById("story-box");
const bear = document.getElementById("bear");
const bearDialog = document.getElementById("bear-dialog");
const startBtn = document.getElementById("start-btn");

const gameArea = document.getElementById("game-area");
const questionCount = document.getElementById("question-count");
const soundBtn = document.getElementById("sound-btn");
const optionsBox = document.getElementById("options");
const feedback = document.getElementById("feedback");

const completeBox = document.getElementById("complete-box");
const nextBtn = document.getElementById("next-btn");

const bgm = document.getElementById("bgm");

const audioPath = "../../04_音檔/animal_word/";

let bgmStarted = false;

let score = 0;
let wrongQuestions = [];

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

        console.log("log result:", result);

        return result.status === "success";

    }catch(error){

        console.error("sendLog error:", error);

        return false;

    }

}

document.addEventListener("click", () => {
    if(bgmStarted) return;

    bgmStarted = true;

    if(bgm){
        bgm.volume = 0.35;
        bgm.play().catch(() => {});
    }

    sendLog({
        event:"level4_bgm_start"
    });
});

const questionBank = [
    { word:"apple", audio:"apple.mp3", answer:"ant" },
    { word:"banana", audio:"banana.mp3", answer:"bat" },
    { word:"cake", audio:"cake.mp3", answer:"cat" },
    { word:"donut", audio:"donut.mp3", answer:"dog" },
    { word:"egg", audio:"egg.mp3", answer:"elf" },
    { word:"fish", audio:"fish.mp3", answer:"fan" },
    { word:"grape", audio:"grape.mp3", answer:"goat" },
    { word:"hamburger", audio:"hamburger.mp3", answer:"hat" },
    { word:"ice cream", audio:"ice cream.mp3", answer:"ink" },
    { word:"juice", audio:"juice.mp3", answer:"jam" },
    { word:"kiwi", audio:"kiwi.mp3", answer:"kite" },
    { word:"lemon", audio:"lemon.mp3", answer:"lip" },
    { word:"milk", audio:"milk.mp3", answer:"map" },
    { word:"noodles", audio:"noodles.mp3", answer:"net" },
    { word:"orange", audio:"orange.mp3", answer:"ox" },
    { word:"pizza", audio:"pizza.mp3", answer:"pig" },
    { word:"rice", audio:"rice.mp3", answer:"red" },
    { word:"sandwich", audio:"sandwich.mp3", answer:"sun" },
    { word:"toast", audio:"toast.mp3", answer:"top" },
    { word:"watermelon", audio:"watermelon.mp3", answer:"web" }
];

let gameQuestions = [];
let currentQuestion = 0;
let currentAudio = null;
let canChoose = true;

setTimeout(() => {
    storyBox.style.display = "block";

    sendLog({
        event:"level4_story_show"
    });

}, 6500);

setTimeout(() => {
    storyBox.style.display = "none";
    bear.classList.add("show");
}, 28500);

setTimeout(() => {
    bearDialog.classList.add("show");
}, 30000);

setTimeout(() => {
    startBtn.classList.add("show");
}, 32500);

startBtn.addEventListener("click", () => {
    startBtn.classList.remove("show");
    bearDialog.classList.remove("show");

    startGame();
});

function startGame(){
    gameQuestions = shuffle([...questionBank]).slice(0,5);
    currentQuestion = 0;
    score = 0;
    wrongQuestions = [];

    gameArea.style.display = "block";

    sendLog({
        event:"level4_start",
        questions:gameQuestions
    });

    showQuestion();
}

function showQuestion(){
    canChoose = true;
    feedback.textContent = "";
    optionsBox.innerHTML = "";

    if(currentAudio){
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const q = gameQuestions[currentQuestion];

    questionCount.textContent = `第 ${currentQuestion + 1} / 5 題`;

    const options = makeOptions(q.answer);

    options.forEach(option => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = option;

        btn.addEventListener("click", () => {
            checkAnswer(btn, option, q.answer, q);
        });

        optionsBox.appendChild(btn);
    });
}

soundBtn.addEventListener("click", () => {
    const q = gameQuestions[currentQuestion];

    playWord(q.audio);

    sendLog({
        event:"level4_play_audio",
        word:q.word,
        audio:q.audio
    });
});

function playWord(audioFile){
    if(currentAudio){
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(audioPath + audioFile);
    currentAudio.play();
}

function makeOptions(answer){
    const wrongPool = questionBank
        .map(item => item.answer)
        .filter(item => item !== answer);

    const wrongOptions = shuffle(wrongPool).slice(0,2);

    return shuffle([answer, ...wrongOptions]);
}

function checkAnswer(btn, selected, answer, questionData){
    if(!canChoose) return;

    canChoose = false;

    const allBtns = document.querySelectorAll(".option-btn");

    allBtns.forEach(button => {
        if(button.textContent === answer){
            button.classList.add("correct");
        }
        else{
            button.classList.add("wrong");
        }

        button.disabled = true;
    });

    if(selected === answer){

        score++;

        feedback.textContent = "答對了！它們有相同的開頭聲音！";

    }
    else{

        wrongQuestions.push({
            questionNumber: currentQuestion + 1,
            questionWord: questionData.word,
            correctAnswer: answer,
            selectedAnswer: selected
        });

        feedback.textContent = `正確答案是 ${answer}`;

    }

    setTimeout(() => {
        currentQuestion++;

        if(currentQuestion < gameQuestions.length){
            showQuestion();
        }
        else{
            completeGame();
        }
    }, 1800);
}

function completeGame(){

    sendLog({
        event:"level4_complete",
        score:score,
        total:5,
        wrongQuestions:wrongQuestions
    });

    gameArea.style.display = "none";
    completeBox.style.display = "block";
}

nextBtn.addEventListener("click", () => {

    sendLog({
        event:"level4_next_level",
        next:"level5"
    });

    window.location.href = "../level5/level5.html";
});

function shuffle(array){
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}