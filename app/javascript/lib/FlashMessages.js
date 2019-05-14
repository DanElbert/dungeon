
const flashMessageTypeMap = {
  error: "danger",
  notice: "success"
};

function flashMessage(flashType, message) {

  if (flashMessageTypeMap[flashType]) {
    flashType = flashMessageTypeMap[flashType];
  }

  const containerElement = document.getElementById("flashContainer");
  const flash = document.createElement("div");
  const close = document.createElement("button");
  const content = document.createTextNode(message);
  flash.classList.add("notification", `is-${flashType}`);
  close.classList.add("delete");
  flash.appendChild(close);
  flash.appendChild(content);
  containerElement.insertBefore(flash, containerElement.firstChild);

  const closeFunc = function() {
    containerElement.removeChild(flash);
  };

  const timeoutId = setTimeout(function() {
    closeFunc();
  }, 5000);

  close.addEventListener("click", function() {
    clearTimeout(timeoutId);
    closeFunc();
  });
}

export {
  flashMessage
}

window.flashMessage = flashMessage;