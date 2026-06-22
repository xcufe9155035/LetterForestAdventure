window.addEventListener("DOMContentLoaded", () => {

    const homePage = document.getElementById("homePage");
    const storyPage = document.getElementById("storyPage");

    const startBtn = document.getElementById("startBtn");
    const storyBtn = document.getElementById("storyBtn");
    const skipStoryBtn = document.getElementById("skipStoryBtn");
    const backHomeBtn = document.getElementById("backHomeBtn");

    // 一開始：首頁顯示、故事頁隱藏
    homePage.classList.remove("hidden");
    storyPage.classList.add("hidden");

    // 點開始冒險：直接進入 1-1
    startBtn.addEventListener("click", () => {
        window.location.href = "level1/level1-1.html";
    });

    // 點故事按鈕：進入故事頁
    storyBtn.addEventListener("click", () => {
        homePage.classList.add("hidden");
        storyPage.classList.remove("hidden");
    });

    // 故事頁的開始任務：進入 1-1
    skipStoryBtn.addEventListener("click", () => {
        window.location.href = "level1/level1-1.html";
    });

    // 回到首頁
    backHomeBtn.addEventListener("click", () => {
        storyPage.classList.add("hidden");
        homePage.classList.remove("hidden");
    });

});