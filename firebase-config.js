import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
