// Import Firebase functions (modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBsSe3frow0J0OM30o4Xc4W2xg_7NXHHsw",
  authDomain: "teamsmic-1c4cf.firebaseapp.com",
  databaseURL: "https://teamsmic-1c4cf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "teamsmic-1c4cf",
  storageBucket: "teamsmic-1c4cf.firebasestorage.app",
  messagingSenderId: "132876622981",
  appId: "1:132876622981:web:a2b6426e8105e4a083ddec",
  measurementId: "G-SG433PRPCQ"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

// Variables globales
let currentUser = null;
let selectedUser = null;

// Connexion Google
document.getElementById("google-login").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";
    saveUser();
    loadUsers();
  } catch (error) {
    console.error(error);
    document.getElementById("auth-message").textContent = error.message;
  }
});

// Sauvegarde utilisateur dans DB
function saveUser() {
  if (!currentUser) return;
  set(ref(db, "users/" + currentUser.uid), {
    name: currentUser.displayName,
    email: currentUser.email
  });
}

// Déconnexion
function logout() {
  signOut(auth).then(() => {
    currentUser = null;
    selectedUser = null;
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("chat-section").style.display = "none";
  });
}

// Charger la liste des utilisateurs
function loadUsers() {
  const usersRef = ref(db, "users");
  onValue(usersRef, (snapshot) => {
    const users = snapshot.val() || {};
    const select = document.getElementById("user-list");
    select.innerHTML = '<option value="">-- Choisir un utilisateur --</option>';
    for (let uid in users) {
      if (uid !== currentUser.uid) {
        const option = document.createElement("option");
        option.value = uid;
        option.textContent = users[uid].name;
        select.appendChild(option);
      }
    }
  });
}

// Sélectionner utilisateur pour chat privé
window.selectUser = function() {
  selectedUser = document.getElementById("user-list").value;
  if (selectedUser) loadMessages();
}

// Envoyer message
window.sendMessage = function() {
  const content = document.getElementById("message-content").value;
  if (!content || !selectedUser) return;

  const chatId = [currentUser.uid, selectedUser].sort().join("_");
  const msgRef = push(ref(db, "private_chats/" + chatId));
  set(msgRef, {
    sender: currentUser.uid,
    content: content,
    timestamp: Date.now()
  });

  document.getElementById("message-content").value = "";
}

// Charger messages privés
function loadMessages() {
  const chatBox = document.getElementById("chat-box");
  const chatId = [currentUser.uid, selectedUser].sort().join("_");
  const chatRef = ref(db, "private_chats/" + chatId);

  onValue(chatRef, (snapshot) => {
    chatBox.innerHTML = "";
    const messages = snapshot.val() || {};
    for (let id in messages) {
      const msg = messages[id];
      const div = document.createElement("div");
      div.innerHTML = `<strong>${msg.sender === currentUser.uid ? "Moi" : "Lui"}:</strong> ${msg.content}`;
      chatBox.appendChild(div);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Surveille connexion
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";
    saveUser();
    loadUsers();
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("chat-section").style.display = "none";
  }
});
