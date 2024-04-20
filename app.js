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
const messageBtn = document.getElementById("message_btn");
const uploadBtn = document.getElementById("upload_btn");
const fileTitle = document.getElementById("file_title");

// Add event listener for key press
messageInput.addEventListener("keydown", function (event) {
  if (event.code === "Enter") {
    event.preventDefault(); // Prevent the default behavior of Enter in a textarea
    sendMessage(); // Call your custom function
  }
});

function uploadFile() {
  const file = fileInput.files[0];

  if (!file) {
    errorElement.innerText = "Error: Please select a file.";
    return;
  }

  uploadBtn.lastElementChild.innerText = "Uploading";
  uploadBtn.disabled = true;
  errorElement.innerText = "";

  const formData = new FormData();

  formData.append("file", file);

  fetch("https://api.chatpdf.com/v1/sources/add-file", {
    method: "POST",
    body: formData,
    headers: {
      "x-api-key": "sec_tkG6I7hOvNmfwQdP28Ru36huO72gCt8y", //API key from chatpdf
    },
  })
    .then((response) => response.json())
    .then((data) => {
      sourceId = data.sourceId;
      uploadedFile = file;
      if (data?.sourceId) {
        fileTitle.innerText = `File Uploaded: ${file?.name}`;
        uploadFileUI.classList.add("tw-hidden");
        chatUI.classList.remove("tw-hidden");
        chatUI.classList.add("tw-flex");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      errorElement.innerText = "Error uploading file.";
      uploadBtn.lastElementChild.innerText = "Uploading";
      uploadBtn.disabled = false;
    });
}

function appendText(text, who = "user") {
  const div = document.createElement("div");
  div.className = "tw-flex tw-flex-col tw-space-y-2 tw-h-auto";
  div.innerHTML = `
  <span class="tw-text-sm tw-font-medium">${
    who === "user" ? "You" : "Unibot"
  }</span>
  <div class="tw-rounded-xl tw-p-2 tw-bg-gray-100 ${
    who == "user" ? "" : "tw-mb-8"
  } tw-text-sm tw-h-fit tw-w-fit tw-leading-5">${text}</div>
  `;
  userMessagesContainer.appendChild(div);
  userMessagesContainer.scrollTop = userMessagesContainer.scrollHeight;
}

function sendMessage() {
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

  messageBtn.disabled = true;
  errorElement.innerText = "";

  appendText(text, "user");
  messageInput.value = "";

  makeMessageAPIRequest(sourceId, text);
}

function makeMessageAPIRequest(sourceId, message) {
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
      "x-api-key": "sec_tkG6I7hOvNmfwQdP28Ru36huO72gCt8y", //API key from chatpdf
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      appendText(data?.content || "", "response");
    })
    .catch((error) => {
      console.error("Error:", error);
      errorElement.innerText = "Error: Failed to get a response.";
    })
    .finally(() => (messageBtn.disabled = false));
}
