const messages = [];

function uploadFile() {
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  if (!file) {
    document.getElementById("status_error").innerHTML =
      "Error: Please select a file.";
    return;
  }

  document.getElementById("status_error").innerHTML = "";
  document.getElementById("status_success").innerHTML = "Uploading...";

  const formData = new FormData();

  formData.append("file", file);

  fetch("https://api.chatpdf.com/v1/sources/add-file", {
    method: "POST",
    body: formData,
    headers: {
      "x-api-key": "sec_tkG6I7hOvNmfwQdP28Ru36huO72gCt8y",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      document.getElementById("status_success").innerHTML =
        "Uploaded Successfully";
      window.location.href = `./chat.html?sourceId=${data.sourceId}`;
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("status_error").innerHTML =
        "Error uploading file.";
    });
}

function appendText(text) {
  const userMessagesContainer = document.getElementById("messages_container");
  const div = document.createElement("div");
  div.className = "rounded-xl p-2 bg-gray-100 text-sm h-fit w-fit leading-5";
  div.innerHTML = text;
  userMessagesContainer.appendChild(div);
}

function sendMessage(event) {
  const searchParams = new URLSearchParams(window.location.search);
  const sourceId = searchParams.get("sourceId");
  const messageInput = document.getElementById("message");
  const text = messageInput.value;

  if (!sourceId) {
    document.getElementById("status_error").innerHTML =
      "Error: Couldn't find source. Please try again from the home page";
    return;
  }

  if (!text) {
    document.getElementById("status_error").innerHTML =
      "Error: Please type a message to send.";
    return;
  }

  event.disabled = true;
  document.getElementById("status_error").innerHTML = "";
  document.getElementById("status_success").innerHTML = "Sending...";

  //   {
  //     "sourceId": "src_xxxxxx",
  //     "messages": [
  //       {
  //         "role": "user",
  //         "content": "how much is the world?"
  //       }
  //     ]
  //   }

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
      console.log(data);
      document.getElementById("status_success").innerHTML = "";
      appendText(data?.content || "");
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("status_error").innerHTML =
        "Error: Failed to get a response.";
    })
    .finally(() => (event.disabled = false));
}
