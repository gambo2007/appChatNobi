
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
var currentUser = null;
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io();
socket.emit('joinRoom', { username, room });
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
  currentUser = users;
});
socket.on('loadMessage', (message) => {
  console.log("load existing mess: ", message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
})
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) {
    return false;
  }
  console.log("user: ", currentUser);
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

function insertEmoji(emoji) {
  const msgInput = document.getElementById('msg');
  msgInput.value += emoji;
}

const showEmojiBtn = document.getElementById('show-emoji-btn');
const emojiContainer = document.getElementById('emoji-container');
const emojis = ["😊", "❤️", "😂", "😍", "😎", "👍", "👏", "🎉", "🌟", "🌈", "🚀", "💡", "💖", "🎈", "🎁", "🍕", "🍦", "🍍", "🎸", "🎮", "🚲", "🏆", "🎤", "⚽", "🎯", "📚", "📷", "💻", "🎧", "🌟"];
function insertEmoji(emoji) {
  const msgInput = document.getElementById('msg');
  const cursorPos = msgInput.selectionStart;
  const textBeforeCursor = msgInput.value.substring(0, cursorPos);
  const textAfterCursor = msgInput.value.substring(cursorPos);
  msgInput.value = textBeforeCursor + emoji + textAfterCursor;
  msgInput.focus();
  msgInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
}

emojis.forEach((emoji) => {
  const emojiElement = document.createElement('span');
  emojiElement.classList.add('emoji');
  emojiElement.innerText = emoji;
  emojiContainer.appendChild(emojiElement);
});
emojiContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('emoji')) {
    insertEmoji(e.target.innerText);
  }
});
showEmojiBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  emojiContainer.classList.toggle('show');
});
document.addEventListener('click', function (e) {
  if (!emojiContainer.contains(e.target) && e.target !== showEmojiBtn) {
    emojiContainer.classList.remove('show');
  }
});
emojiContainer.addEventListener('click', function (e) {
  e.stopPropagation();
});



function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

document.getElementById('quit-btn').addEventListener('click', () => {
  const quitRoom = confirm('Are u sure to quit this room?');
  if (quitRoom) {
    window.location = '../index.html';
  } else {
  }
});
