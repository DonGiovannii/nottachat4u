let encryptionKey = null;

function login() {
  const passphrase = document.getElementById("password").value;
  const salt = CryptoJS.enc.Hex.parse("a1b2c3d4e5f6"); // static salt for now
  const key = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });
  encryptionKey = key;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";
  fetchMessages();
}

function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, encryptionKey.toString()).toString();
}

function decryptMessage(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey.toString());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "[Decryption Failed]";
  }
}

function sendMessage() {
  const message = document.getElementById("message").value;
  const username = document.getElementById("username").value || "Anonymous";
  if (!message.trim()) return;

  const timestamp = new Date().toISOString();
  const payload = {
    text: encryptMessage(message),
    user: encryptMessage(username),
    time: encryptMessage(timestamp),
  };

  db.ref("messages").push(payload);
  document.getElementById("message").value = "";
}

function fetchMessages() {
  db.ref("messages").on("value", (snapshot) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    const data = snapshot.val();
    for (let key in data) {
      const msg = data[key];
      const user = decryptMessage(msg.user);
      const text = decryptMessage(msg.text);
      const time = new Date(decryptMessage(msg.time)).toLocaleString();
      const msgEl = document.createElement("div");
      msgEl.className = "message";
      msgEl.innerText = `[${time}] ${user}: ${text}`;
      messagesDiv.appendChild(msgEl);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

