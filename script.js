window.addEventListener(
"DOMContentLoaded",

()=>{

const homePage=
document.getElementById(
"homePage"
);

const storyPage=
document.getElementById(
"storyPage"
);

const startBtn=
document.getElementById(
"startBtn"
);

const storyBtn=
document.getElementById(
"storyBtn"
);

const skipStoryBtn=
document.getElementById(
"skipStoryBtn"
);

const backHomeBtn=
document.getElementById(
"backHomeBtn"
);

const playerModal=
document.getElementById(
"playerModal"
);

const playerId=
document.getElementById(
"playerId"
);

const playerEmail=
document.getElementById(
"playerEmail"
);

const confirmPlayerBtn=
document.getElementById(
"confirmPlayerBtn"
);

const playerError=
document.getElementById(
"playerError"
);



homePage.classList.remove(
"hidden"
);

storyPage.classList.add(
"hidden"
);



startBtn.addEventListener(
"click",

()=>{

playerModal.classList.remove(
"hidden"
);

}
);



storyBtn.addEventListener(
"click",

()=>{

homePage.classList.add(
"hidden"
);

storyPage.classList.remove(
"hidden"
);

}
);



skipStoryBtn.addEventListener(
"click",

()=>{

playerModal.classList.remove(
"hidden"
);

}
);



backHomeBtn.addEventListener(
"click",

()=>{

storyPage.classList.add(
"hidden"
);

homePage.classList.remove(
"hidden"
);

}
);



confirmPlayerBtn.addEventListener(
"click",

async ()=>{

const idValue=
playerId.value.trim();

const emailValue=
playerEmail.value.trim();



if(
idValue===""

||

emailValue===""

){

playerError.textContent=
"請輸入 ID 和 Email";

return;

}



const emailRule=
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;



if(
!emailRule.test(
emailValue
)
){

playerError.textContent=
"Email 格式錯誤";

return;

}



localStorage.setItem(
"playerId",
idValue
);

localStorage.setItem(
"playerEmail",
emailValue
);



await sendLog({

event:"game_start",

player:idValue,

page:"index"

});



playerModal.classList.add(
"hidden"
);



window.location.href=
"03_程式/level1/level1-1.html";

});

});



async function sendLog(logData){

try{

const payload={

name:
localStorage.getItem(
"playerId"
),

email:
localStorage.getItem(
"playerEmail"
),

log:
typeof logData==="object"
?
JSON.stringify(
logData
)
:
logData

};



const response=
await fetch(
"/api/log",
{

method:"POST",

headers:{

"Content-Type":
"application/json"

},

body:
JSON.stringify(
payload
)

}
);



const result=
await response.json();



console.log(
"log result:",
result
);



return result.status==="success";

}catch(error){

console.error(
"sendLog error:",
error
);



return false;

}

}