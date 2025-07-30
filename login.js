import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBAFx0Ad-8RKji4cDNYWm1yPTkx4RpRwWM",
  authDomain: "opportuna-a14bb.firebaseapp.com",
  projectId: "opportuna-a14bb",
  storageBucket: "opportuna-a14bb.appspot.com",
  messagingSenderId: "906149069855",
  appId: "1:906149069855:web:618ed823248443db30812a",
  measurementId: "G-GJGCWL01W4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let isLogin = true;

// Toggle login/signup
document.getElementById("toggleAuth").addEventListener("click", (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  document.getElementById("authTitle").innerText = isLogin ? "Login" : "Sign Up";
  document.getElementById("authActionBtn").innerText = isLogin ? "Login" : "Sign Up";
  document.getElementById("displayName").style.display = isLogin ? "none" : "block";
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const displayName = document.getElementById("displayName").value;

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCred.user, { displayName });
      }
    }
    alert("Success! Redirecting...");
    window.location.href = "index.html";
  } catch (err) {
    alert("Error: " + err.message);
    console.error(err);
  }
});

document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "index.html";
  } catch (err) {
    alert("Google Sign-in Error: " + err.message);
  }
});

// Auto-redirect if already signed in
onAuthStateChanged(auth, (user) => {
  if (user && location.pathname.includes("login")) {
    window.location.href = "index.html";
  }
});
