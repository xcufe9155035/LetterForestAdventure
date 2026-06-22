const compassScreen = document.getElementById("compassScreen");
const nextAreaBtn = document.getElementById("nextAreaBtn");
const bgm = document.getElementById("bgm");

bgm.volume = 0.25;

const introScreen = document.getElementById("introScreen");
const gameScreen = document.getElementById("gameScreen");
const endingScreen = document.getElementById("endingScreen");

const trailSign = document.getElementById("trailSign");
const introDialog = document.querySelector(".intro-dialog");
const compassReward = document.querySelector(".compass-reward");

const questionCount = document.getElementById("questionCount");
const progressDots = document.getElementById("progressDots");
const letterRow = document.getElementById("letterRow");
const optionsArea = document.getElementById("optionsArea");
const feedback = document.getElementById("feedback");

let introShown = false;
let introFinished = false;

const allQuestions = [
  ["A", "B", "C", "D", "E", "F"],
  ["B", "C", "D", "E", "F", "G"],
  ["C", "D", "E", "F", "G", "H"],
  ["D", "E", "F", "G", "H", "I"],
  ["E", "F", "G", "H", "I", "J"],
  ["F", "G", "H", "I", "J", "K"],
  ["G", "H", "I", "J", "K", "L"],
  ["H", "I", "J", "K", "L", "M"],
  ["I", "J", "K", "L", "M", "N"],
  ["J", "K", "L", "M", "N", "O"],
  ["K", "L", "M", "N", "O", "P"],
  ["L", "M", "N", "O", "P", "Q"],
  ["M", "N", "O", "P", "Q", "R"],
  ["N", "O", "P", "Q", "R", "S"],
  ["O", "P", "Q", "R", "S", "T"],
  ["P", "Q", "R", "S", "T", "U"],
  ["Q", "R", "S", "T", "U", "V"],
  ["R", "S", "T", "U", "V", "W"],
  ["S", "T", "U", "V", "W", "X"],
  ["U", "V", "W", "X", "Y", "Z"]
];

let selectedQuestions = [];
let currentIndex = 0;
let currentAnswer = "";

document.addEventListener("click", showIntroOnce);

trailSign.addEventListener("click", startGame);

introDialog.addEventListener("click", function(event){
  event.stopPropagation();
  closeIntroDialog();
});

compassReward.addEventListener("click", collectCompass);

nextAreaBtn.addEventListener("click", function(){
  window.location.href = "../level3/level3.html";
});

function showIntroOnce(){
  if(introShown){
    return;
  }

  introShown = true;
  introScreen.classList.remove("hidden");

  bgm.play();

  document.removeEventListener("click", showIntroOnce);
}

function closeIntroDialog(){
  introScreen.classList.add("hidden");
  introFinished = true;
}

function startGame(){
  if(!introFinished){
    return;
  }

  introScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  selectedQuestions = shuffle([...allQuestions]).slice(0, 3);
  currentIndex = 0;

  showQuestion();
}

function showQuestion(){
  feedback.textContent = "";
  letterRow.innerHTML = "";
  optionsArea.innerHTML = "";

  letterRow.classList.remove("success-glow");

  const currentQuestion = selectedQuestions[currentIndex];
  const missingIndex = Math.floor(Math.random() * 6);

  currentAnswer = currentQuestion[missingIndex];

  questionCount.textContent = `第 ${currentIndex + 1} / 3 題`;

  progressDots.textContent =
    "● ".repeat(currentIndex + 1) +
    "○ ".repeat(2 - currentIndex);

  currentQuestion.forEach((letter, index) => {
    const card = document.createElement("div");
    card.className = "letter-card";

    if(index === missingIndex){
      card.textContent = "?";
      card.classList.add("missing");
      card.dataset.missing = "true";
    }else{
      card.textContent = letter;
    }

    letterRow.appendChild(card);
  });

  const options = createNearbyOptions(currentAnswer, currentQuestion);
  shuffle(options);

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = option;

    btn.addEventListener("click", () => {
      checkAnswer(btn, option);
    });

    optionsArea.appendChild(btn);
  });
}

function checkAnswer(button, selected){
  const buttons = document.querySelectorAll(".option-btn");

  buttons.forEach(btn => {
    btn.disabled = true;
  });

  if(selected === currentAnswer){
    button.classList.add("correct");

    if(currentIndex === 2){
      feedback.textContent = "太棒了！整座森林的路牌恢復光芒 ✨";
    }else{
      feedback.textContent = "答對了！路牌恢復光芒 ✨";
    }

    const missingCard = document.querySelector("[data-missing='true']");

    missingCard.textContent = currentAnswer;
    missingCard.classList.remove("missing");
    missingCard.classList.add("fixed");

    letterRow.classList.add("success-glow");

    setTimeout(() => {
      currentIndex++;

      if(currentIndex >= 3){
        showEnding();
      }else{
        showQuestion();
      }
    }, 1500);

  }else{
    button.classList.add("wrong");

    feedback.textContent = "再想想字母的順序喔！";

    setTimeout(() => {
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("wrong");
      });

      feedback.textContent = "";
    }, 900);
  }
}

function createNearbyOptions(answer, currentQuestion){
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const index = alphabet.indexOf(answer);

  const visibleLetters = currentQuestion.filter(letter => letter !== answer);

  let pool = [];

  for(let i = -3; i <= 3; i++){
    if(i === 0) continue;

    const newIndex = index + i;

    if(newIndex >= 0 && newIndex < alphabet.length){
      const candidate = alphabet[newIndex];

      if(!visibleLetters.includes(candidate)){
        pool.push(candidate);
      }
    }
  }

  if(pool.length < 2){
    alphabet.forEach(letter => {
      if(
        letter !== answer &&
        !visibleLetters.includes(letter) &&
        !pool.includes(letter)
      ){
        pool.push(letter);
      }
    });
  }

  shuffle(pool);

  return [
    answer,
    pool[0],
    pool[1]
  ];
}

function showEnding(){
  gameScreen.classList.add("hidden");
  endingScreen.classList.remove("hidden");

  setTimeout(() => {
    endingScreen.classList.add("hidden");
    compassScreen.classList.remove("hidden");
  }, 8000);
}

function collectCompass(){
  compassReward.classList.add("collected");

  setTimeout(() => {
    compassScreen.classList.add("hidden");

    document.body.classList.add("next-area-mode");

    nextAreaBtn.classList.remove("hidden");
  }, 900);
}

function shuffle(array){
  return array.sort(() => Math.random() - 0.5);
}