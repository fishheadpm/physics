let allQuestions = [];
let questions = [];
let index = 0;
let correct = 0;
const wrongKey = "physics_magnetic_wrong_ids";

const $ = (id) => document.getElementById(id);

async function loadData(){
  const res = await fetch("data.json");
  const data = await res.json();
  allQuestions = data[0].questions;
  updateStatus();
}

function wrongIds(){
  return JSON.parse(localStorage.getItem(wrongKey) || "[]");
}

function saveWrong(id){
  const ids = new Set(wrongIds());
  ids.add(id);
  localStorage.setItem(wrongKey, JSON.stringify([...ids]));
}

function removeWrong(id){
  const ids = wrongIds().filter(x => x !== id);
  localStorage.setItem(wrongKey, JSON.stringify(ids));
}

function updateStatus(){
  $("status").textContent = `全${allQuestions.length}問 / 間違い履歴 ${wrongIds().length}問`;
}

function show(section){
  ["menu","quiz","result"].forEach(id => $(id).classList.add("hidden"));
  $(section).classList.remove("hidden");
}

function start(mode="all"){
  index = 0;
  correct = 0;
  if(mode === "wrong"){
    const ids = new Set(wrongIds());
    questions = allQuestions.filter(q => ids.has(q.id));
    if(questions.length === 0){
      alert("間違えた問題はありません。");
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
  $("question").textContent = q.question;
  $("answerInput").value = "";
  $("answerBox").textContent = "";
  $("answerBox").classList.add("hidden");
  $("judgeButtons").classList.add("hidden");
  $("answerInput").focus();
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
    $("resultText").textContent = `${questions.length}問中 ${correct}問 正解。`;
    updateStatus();
    show("result");
  }else{
    renderQuestion();
  }
}

$("startBtn").onclick = () => start("all");
$("reviewBtn").onclick = () => start("wrong");
$("resetBtn").onclick = () => {
  localStorage.removeItem(wrongKey);
  updateStatus();
};
$("showBtn").onclick = showAnswer;
$("correctBtn").onclick = () => judge(true);
$("wrongBtn").onclick = () => judge(false);
$("backBtn").onclick = () => { updateStatus(); show("menu"); };
$("againBtn").onclick = () => start("all");
$("menuBtn").onclick = () => { updateStatus(); show("menu"); };

loadData();
