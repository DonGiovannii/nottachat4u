let encryptionKey = null;

function login() {
  const passphrase = document.getElementById("password").value;
  const salt = CryptoJS.enc.Hex.parse("a1b2c3d4e5f6");
  const key = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });
  encryptionKey = key;

  document.getElementById("login-screen").classList.add("hidden");
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
  const expireOption = document.getElementById("expireOption").value;
  if (!message.trim()) return;

  const timestamp = new Date().toISOString();
  const payload = {
    text: encryptMessage(message),
    user: encryptMessage(username),
    time: encryptMessage(timestamp),
    expireOption: encryptMessage(expireOption),
    views: encryptMessage("0"),
    viewedAt: encryptMessage("")
  };

  db.ref("messages").push(payload);
  document.getElementById("message").value = "";
}

function fetchMessages() {
  db.ref("messages").on("value", (snapshot) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    const data = snapshot.val();
    if (!data) return;

    for (let key in data) {
      const msg = data[key];
      const text = decryptMessage(msg.text);
      const user = decryptMessage(msg.user);
      const timeStr = decryptMessage(msg.time);
      const expireOption = decryptMessage(msg.expireOption);
      let views = parseInt(decryptMessage(msg.views)) || 0;
      let viewedAt = decryptMessage(msg.viewedAt);

      const now = new Date();
      let deleteRef = false;

      if (expireOption === "1view" && views >= 1) {
        deleteRef = true;
      }

      if (viewedAt) {
        const viewedDate = new Date(viewedAt);
        const elapsedMinutes = (now - viewedDate) / 60000;

        if (expireOption === "5min" && elapsedMinutes > 5) deleteRef = true;
        if (expireOption === "15min" && elapsedMinutes > 15) deleteRef = true;
        if (expireOption === "1hr" && elapsedMinutes > 60) deleteRef = true;
      }

      if (deleteRef) {
        db.ref(`messages/${key}`).remove();
        continue; // ✅ VALID because it's inside the loop
      }

      if (!viewedAt) {
        const nowStr = now.toISOString();
        db.ref(`messages/${key}/viewedAt`).set(encryptMessage(nowStr));
        db.ref(`messages/${key}/views`).set(encryptMessage("1"));
      }

      const msgEl = document.createElement("div");
      msgEl.className = "message";
      msgEl.innerText = `[${new Date(timeStr).toLocaleString()}] ${user}: ${text}`;
      messagesDiv.appendChild(msgEl);
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

function clearAllMessages() {
  if (confirm("Are you sure you want to delete all messages? This cannot be undone.")) {
    db.ref("messages").remove();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("message").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  document.getElementById("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      login();
    }
  });
});

