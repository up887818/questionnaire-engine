'use strict';

async function checkQuestionnaireExists(name) {
  if (!(name === "")) {
    let response = await fetch(`/check?name=${name}`);
    if (response.ok) {
      const id = await response.text();
      console.log(id);
      if (id != "") {
        localStorage.setItem("questionnaire-id", id);
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
}

async function loadQuestionnaire() {
  //Prompt user to give input
  const userInput = window.prompt("Type in the name of the questionnaire:");

  // userInput = null means they cancelled prompt. No point in checking further
  if (userInput !== null) {
    // Returns bool value
    const existsBool = await checkQuestionnaireExists(userInput);
    console.log(existsBool);
    if (existsBool) {
      //checkQuestionnaireExists adds userInput to localStorage. This will
      //be used to access the correct questionnaire. Just redirect to load page.
      window.location.href = "../load.html";
    } else {
      //User has typed invalid questionnaire name.
      window.alert("That questionnaire does not exist");
    }
  }
}

function createQuestionnaire() {
  const userInput = window.prompt("Type in the name of the questionnaire:");

  if (userInput !== null) {
    sessionStorage.addItem("edit-mode", "false");
    sessionStorage.addItem("questionnaire-name", userInput);

    window.location.href = "../create.html";
  }
}

async function uploadJson() {
  // first check to see if there is a json file
  const jsonFile = document.querySelector("jsonFile").files[0];
  if (jsonFile == null) {
    window.alert("You haven't uploaded a json file!")
  } else {
    const openJson = JSON.parse(jsonFile);
    // get users response choice
    const userInput = window.prompt("Do you want the responses in CSV or JSON?");

    if (userInput !== null) {
      const jsonChoice = false;
      if (userInput.toLowerCase() == "json") {
        jsonChoice = true;
      }
    }

    // get email
    const email = sessionStorage.getItem("user-email");

    // todo: get this to work with images

    // upload to server & database
    const url = `/create?data=${openJson}&email=${email}&json=${jsonChoice}`;
    let response = await fetch(url, {
      method: 'POST'
    });
    if (response.ok) {
      window.alert("Thanks for uploading a questionnaire!");
    } else {
      window.alert("There has been an error. Please try again later.");
    }
  }
}

function editQuestionnaire() {
  sessionStorage.addItem("edit-mode", "true");

  // should get h3 element
  const nameEle = event.target.parentElement.firstChild;
  const name = nameEle.textContent;

  sessionStorage.addItem("questionnaire-name", name);
}

// login functionality
function fbLogin(response) {
  if (response.status === 'connected') {
    loadItems(email);
  }
}

function onSignIn(googleuser) {
  const profile = googleuser.getBasicProfile();
  const email = profile.getEmail();
  const name = profile.getGivenName();
  loadItems(email, name);
}

async function loadItems(email, name) {
  // add email to sessionstorage
  sessionStorage.setItem("user-email", email);
  // show the items that is only available post-login
  const hidden = document.querySelector(".hideByDefault");
  hidden.style.display = 'inline';

  const textBox = document.querySelector("h2");
  textBox.textContent = `${name}'s Questionnaires`;

  // show questionnaires
  const url = `/getQuestionnaires?email=${email}`;
  let response = await fetch(url);

  if (response.ok) {
    const data = await response.json();
    generateHtml(data);
  };
}

function download(element, filename) {
  element.setAttribute('href', filename);

  element.click();

  element.setAttribute('href', "#");
}

async function generateHtml(data) {
  const destination = document.querySelector(".hideByDefault");
  const template = document.querySelector("#questionnaire");

  for (const questionnaire of data) {
    // copy template
    let clone = template.content.cloneNode(true);
    // write name
    let nameBox = clone.querySelectorAll("h3")[0];
    nameBox.textContent = questionnaire.name;
    // get buttons
    let buttons = clone.querySelectorAll("button");
    buttons[0].addEventListener("click", edit);
    // get download link
    if (questionnaire.json) {
      buttons[1].addEventListener("click", function() {
        const a = event.target.parentElement.getElementsByTagName("a")[0];
        download(a, `/client/questionnaires/${questionnaire.id}/responses.json`);
      });
    } else {
      buttons[1].addEventListener("click", function() {
        const a = event.target.parentElement.getElementsByTagName("a")[0];
        download(a, `/client/questionnaires/${questionnaire.id}/responses.csv`);
      });
    }
    // destination.children[1] gets 2nd child
    destination.insertBefore(clone, destination.children[1]);
  };
}