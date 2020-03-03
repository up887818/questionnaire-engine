'use strict';

async function checkQuestionnaireExists() {
  let name = inputBox.value;
  localStorage.setItem("questionnaire-name", name);
  // console.log(localStorage.getItem("questionnaire-name"));
  let exists = "false";
  let existsBool = false;
  // temp value
  if (!(name === "")) {
    let url = `/check?name=${name}`;

    let response = await fetch(url);
    exists = await response.text();
  }
  if (exists === "true") {
    existsBool = true;
  } else {
    existsBool = false;
  }
  return existsBool;
}

async function createQuestionnaire() {
  let existsBool = await checkQuestionnaireExists();
  if (!existsBool) {
    // href - emulates mouse click. allows user to press back button
    window.location.href = "create.html";
  } else {
    let errorBox = document.querySelector("#errorBox");
    errorBox.textContent = "That Questionnaire already exists.";
  }
}

async function loadQuestionnaire() {
  let existsBool = await checkQuestionnaireExists();
  if (existsBool) {
    window.location.href = "load.html";
  } else {
    let errorBox = document.querySelector("#errorBox");
    errorBox.textContent = "That Questionnaire does not exist.";
  }
}

const inputBox = document.querySelector("#inputBox");

const createButton = document.getElementsByName("create")[0];
const loadButton = document.getElementsByName("load")[0];

createButton.addEventListener("click", createQuestionnaire);
loadButton.addEventListener("click", loadQuestionnaire);