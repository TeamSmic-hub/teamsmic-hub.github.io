const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;
let selectedUser = null;

// Connexion avec Google
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            currentUser = result.user;
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("chat-section").style.display = "block";
            loadUsers();
        })
        .catch(error => {
            document.getElementById("auth-message").textContent = error.message;
        });
}

// Déconnexion
function logout() {
    auth.signOut().then(() => {
        currentUser = null;
        selectedUser = null;
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("chat-section").style.display = "none";
    });
}

// Charger la liste des utilisateurs (sauf soi)
function loadUsers() {
    db.ref("users").once("value", snapshot => {
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

    // Ajouter l'utilisateur courant à la base
    db.ref("users/" + currentUser.uid).set({
        name: currentUser.displayName,
        email: currentUser.email
    });
}

// Sélectionner un utilisateur pour chat privé
function selectUser() {
    selectedUser = document.getElementById("user-list").value;
    if (selectedUser) {
        loadMessages();
    }
}

// Envoyer un message
function sendMessage() {
    const content = document.getElementById("message-content").value;
    if (!content || !selectedUser) return;

    const chatId = [currentUser.uid, selectedUser].sort().join("_");
    const messageRef = db.ref("private_chats/" + chatId).push();
    messageRef.set({
        sender: currentUser.uid,
        content: content,
        timestamp: Date.now()
    });
    document.getElementById("message-content").value = "";
}

// Charger les messages privés
function loadMessages() {
    const chatBox = document.getElementById("chat-box");
    const chatId = [currentUser.uid, selectedUser].sort().join("_");

    db.ref("private_chats/" + chatId).on("value", snapshot => {
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
