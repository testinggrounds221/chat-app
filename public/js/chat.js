const socket = io();

// Elements
const $messageForm = document.querySelector("#sndForm");
const $messageFormButton = $messageForm.querySelector("button");
const $messageFormInput = $messageForm.querySelector("input");
const $sendLocationButton = document.querySelector("#send-location");

const $messages = document.querySelector("#messages");
const $location = document.querySelector("#location");
const $sidebar = document.querySelector("#sidebar");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // new Message element
  const $newMessage = $messages.lastElementChild;

  //Height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of the message container
  const containerHeight = $messages.scrollHeight;

  // How far scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (loc) => {
  console.log(loc);
  const html = Mustache.render(locationTemplate, {
    username: loc.username,
    loc: loc.url,
    createdAt: moment(loc.createdAt).format("h:mm a"),
  });
  $location.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const msg = e.target.elements.message.value;
  $messageFormInput.value = "";
  $messageFormInput.focus();

  socket.emit("sendMessage", msg, (error) => {
    $messageFormButton.removeAttribute("disabled");
    if (error) {
      return console.log(error);
    }
    console.log("Delivered message");
  });
});

document.getElementById("send-location").addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not Supported in your browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      () => {
        console.log("Location shared");
        $sendLocationButton.removeAttribute("disabled");
        $messageFormInput.focus();
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert("username already eists");
    location.href = "/";
  }
});
