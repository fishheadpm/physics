let rounds = [];
let currentRound = null;
let allQuestions = [];
let questions = [];
let index = 0;
let correct = 0;
let currentMode = "all";

const $ = (id) => document.getElementById(id);

function wrongKey(roundId){
  return `physics_wrong_ids_${roundId}`;
}

async function loadData(){
  const res = await fetch("data.json");
  rounds = await res.json();

  if(!Array.isArray(rounds) || rounds.length === 0){
    $("roundList").innerHTML = "<p>問題データがありません。</p>";
    return;
  }

  currentRound = rounds[0];
  allQuestions = currentRound.questions || [];
  renderRoundMenu();
  updateStatus();
}

function renderRoundMenu(){
  const list = $("roundList");
  list.innerHTML = "";

  rounds.forEach(round => {
    const btn = document.createElement("button");
    btn.className = "round-btn";
    btn.innerHTML = `
      <span class="round-title">${escapeHtml(round.name || round.id)}</span>
      <span class="round-count">${(round.questions || []).length}問</span>
    `;
    btn.onclick = () => {
      currentRound = round;
      allQuestions = currentRound.questions || [];
      start("all");
    };
    list.appendChild(btn);
  });
}

function wrongIds(){
  if(!currentRound) return [];
  return JSON.parse(localStorage.getItem(wrongKey(currentRound.id)) || "[]");
}

function saveWrong(id){
  const ids = new Set(wrongIds());
  ids.add(id);
  localStorage.setItem(wrongKey(currentRound.id), JSON.stringify([...ids]));
}

function removeWrong(id){
  const ids = wrongIds().filter(x => x !== id);
  localStorage.setItem(wrongKey(currentRound.id), JSON.stringify(ids));
}

function updateStatus(){
  if(!currentRound){
    $("status").textContent = "";
    return;
  }
  $("status").textContent =
    `選択中：${currentRound.name || currentRound.id} / 全${allQuestions.length}問 / 間違い履歴 ${wrongIds().length}問`;
}

function show(section){
  ["menu","quiz","result"].forEach(id => $(id).classList.add("hidden"));
  $(section).classList.remove("hidden");
}

function start(mode="all"){
  if(!currentRound) return;

  currentMode = mode;
  index = 0;
  correct = 0;
  allQuestions = currentRound.questions || [];

  if(mode === "wrong"){
    const ids = new Set(wrongIds());
    questions = allQuestions.filter(q => ids.has(q.id));
    if(questions.length === 0){
      alert("この単元に、間違えた問題はありません。");
      return;
    }
  }else{
    questions = [...allQuestions];
  }

  show("quiz");
  renderQuestion();
}

function renderQuestion(){
  const q = questions[index];
  $("count").textContent = `${index + 1} / ${questions.length}`;
  $("roundName").textContent = currentRound.name || currentRound.id;
  $("question").textContent = q.question;
  $("answerBox").textContent = "";
  $("answerBox").classList.add("hidden");
  $("judgeButtons").classList.add("hidden");
}

function showAnswer(){
  const q = questions[index];
  $("answerBox").textContent = q.answer;
  $("answerBox").classList.remove("hidden");
  $("judgeButtons").classList.remove("hidden");
}

function judge(isCorrect){
  const q = questions[index];

  if(isCorrect){
    correct++;
    removeWrong(q.id);
  }else{
    saveWrong(q.id);
  }

  index++;

  if(index >= questions.length){
    $("resultText").textContent = `${currentRound.name || currentRound.id}：${questions.length}問中 ${correct}問「わかっていた」。`;
    updateStatus();
    show("result");
  }else{
    renderQuestion();
  }
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

$("reviewBtn").onclick = () => start("wrong");
$("resetBtn").onclick = () => {
  if(!currentRound) return;
  localStorage.removeItem(wrongKey(currentRound.id));
  updateStatus();
};
$("showBtn").onclick = showAnswer;
$("correctBtn").onclick = () => judge(true);
$("wrongBtn").onclick = () => judge(false);
$("backBtn").onclick = () => { updateStatus(); show("menu"); };
$("againBtn").onclick = () => start(currentMode);
$("menuBtn").onclick = () => { updateStatus(); show("menu"); };

loadData();
