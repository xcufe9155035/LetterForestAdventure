const reportContent =
document.getElementById("report-content");

const finishBtn =
document.getElementById("finish-btn");

async function sendLog(logData){

    try{

        await fetch("/api/log",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                log:JSON.stringify(logData)
            })
        });

    }catch(error){

        console.error(error);

    }

}

window.addEventListener("load",()=>{

    reportContent.innerHTML = `

    ⭐ 字母順序能力：優秀<br><br>

    🐾 動物單字聽辨能力：良好<br><br>

    🔊 字首音辨識能力：持續進步中<br><br>

    建議：<br>

    可以多練習動物單字的發音與字首音辨識，
    相信你很快就能成為真正的字母森林守護者！

    `;

    sendLog({
        event:"ai_report_show"
    });

});

finishBtn.addEventListener("click",()=>{

    sendLog({
        event:"game_complete"
    });

    window.location.href =
    "../home/home.html";

});