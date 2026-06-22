const animalBank = [
    "bear",
    "dog",
    "goat",
    "pig",
    "bird",
    "duck",
    "horse",
    "rabbit",
    "cat",
    "elephant",
    "lion",
    "sheep",
    "chicken",
    "fish",
    "monkey",
    "tiger",
    "cow",
    "frog",
    "mouse",
    "turtle"
];

const totalQuestions = 5;

let gameQuestions = [];
let currentQuestion = 0;
let currentWord = "";
let currentAudio = null;
let canClick = true;

const startBtn = document.getElementById("start-btn");
const storyText = document.getElementById("story-text");
const bgm = document.getElementById("bgm");

if(bgm){
    bgm.volume = 0.25;
}

let storyStarted = false;

document.addEventListener("click",()=>{

    if(storyStarted) return;

    storyStarted = true;

    if(bgm){
        bgm.play().catch(()=>{});
    }

    storyText.classList.add("play");

    setTimeout(()=>{

        startBtn.classList.remove("hidden");
        startBtn.classList.add("show");

    },12000);

});

const introBox = document.getElementById("intro-box");
const darkOverlay = document.getElementById("dark-overlay");

const gameArea = document.getElementById("game-area");
const cardsArea = document.getElementById("cards-area");

const progressText = document.getElementById("progress-text");
const playAudioBtn = document.getElementById("play-audio-btn");

const completeBox = document.getElementById("complete-box");
const nextBtn = document.getElementById("next-btn");

function shuffle(array){
    const arr = [...array];

    for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

function createQuestionSet(){
    gameQuestions = shuffle(animalBank).slice(0,totalQuestions);
}

function playWord(word){
    if(currentAudio){
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(`../../04_音檔/animal_word/${word}.mp3`);
    currentAudio.play();
}

function updateProgress(){
    progressText.textContent = `第 ${currentQuestion + 1} / ${totalQuestions} 題`;
}

function createOptions(correctWord){
    const wrongOptions = shuffle(
        animalBank.filter(item => item !== correctWord)
    ).slice(0,3);

    return shuffle([correctWord,...wrongOptions]);
}

function loadQuestion(){
    canClick = true;
    updateProgress();

    currentWord = gameQuestions[currentQuestion];
    cardsArea.innerHTML = "";

    const options = createOptions(currentWord);

    options.forEach(word=>{
        const card = document.createElement("div");
        card.className = "animal-card";

        card.innerHTML = `
            <img src="../../02_素材/圖卡/animal/${word}.png" alt="${word}">
        `;

        card.addEventListener("click",()=>{
            if(!canClick) return;

            if(word === currentWord){
                canClick = false;
                card.classList.add("correct");

                setTimeout(()=>{
                    currentQuestion++;

                    if(currentQuestion >= totalQuestions){
                        showComplete();
                    }else{
                        loadQuestion();
                    }
                },700);
            }else{
                card.classList.add("wrong");

                setTimeout(()=>{
                    card.classList.remove("wrong");
                },450);
            }
        });

        cardsArea.appendChild(card);
    });

}

function showComplete(){
    gameArea.classList.add("hidden");
    darkOverlay.style.display = "block";
    completeBox.classList.remove("hidden");

    setTimeout(()=>{
        nextBtn.classList.add("show");
    },3000);
}

startBtn.addEventListener("click",()=>{
    introBox.classList.add("hidden");
    darkOverlay.style.display = "none";
    gameArea.classList.remove("hidden");

    createQuestionSet();
    loadQuestion();
});

playAudioBtn.addEventListener("click",()=>{
    playWord(currentWord);
});

nextBtn.addEventListener("click",()=>{

    if(bgm){
        bgm.pause();
        bgm.currentTime = 0;
    }

    window.location.href = "../level4/level4.html";
});