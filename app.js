const messages = [];
let sourceId = null;
let uploadedFile = null;
const uploadFileUI = document.getElementById("upload_file_ui");
const chatUI = document.getElementById("chat_ui");
const successElement = document.getElementById("status_success");
const errorElement = document.getElementById("status_error");
const fileInput = document.getElementById("file");
const userMessagesContainer = document.getElementById("messages_container");
const messageInput = document.getElementById("message");
const uploadBtn = document.getElementById("upload_btn");
const fileTitle = document.getElementById("file_title");

function uploadFile() {
  const file = fileInput.files[0];

  if (!file) {
    errorElement.innerText = "Error: Please select a file.";
    return;
  }

  uploadBtn.innerText = "Uploading";
  uploadBtn.disabled = true;
  errorElement.innerText = "";

  const formData = new FormData();

  formData.append("file", file);

  fetch("https://api.chatpdf.com/v1/sources/add-file", {
    method: "POST",
    body: formData,
    headers: {
      "x-api-key": "", //API key from chatpdf
    },
  })
    .then((response) => response.json())
    .then((data) => {
      sourceId = data.sourceId;
      uploadedFile = file;
      if (data?.sourceId) {
        fileTitle.innerText = `File: ${file?.name}`;
        uploadFileUI.classList.add("hidden");
        chatUI.classList.remove("hidden");
        chatUI.classList.add("flex");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      errorElement.innerText = "Error uploading file.";
    });
}

function appendText(text) {
  const div = document.createElement("div");
  div.className = "rounded-xl p-2 bg-gray-100 text-sm h-fit w-fit leading-5";
  div.innerHTML = text;
  userMessagesContainer.appendChild(div);
}

function sendMessage(event) {
  const text = messageInput.value;

  if (!sourceId) {
    errorElement.innerText =
      "Error: Couldn't find source. Please try again from the home page";
    return;
  }

  if (!text) {
    errorElement.innerText = "Error: Please type a message to send.";
    return;
  }

  event.disabled = true;
  errorElement.innerText = "";

  appendText(text);
  messageInput.value = "";

  makeMessageAPIRequest(sourceId, text, event);
}

function makeMessageAPIRequest(sourceId, message, event) {
  const data = {
    referenceSources: true,
    sourceId: sourceId,
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  };

  fetch("https://api.chatpdf.com/v1/chats/message", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "x-api-key": "", //API key from chatpdf
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      appendText(data?.content || "");
    })
    .catch((error) => {
      console.error("Error:", error);
      errorElement.innerHTML = "Error: Failed to get a response.";
    })
    .finally(() => (event.disabled = false));
}
