// assets/login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
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

// Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const displayNameInput = document.getElementById("displayName");
const authTitle = document.getElementById("authTitle");
const authActionBtn = document.getElementById("authActionBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");

let isLogin = true;

// Toggle login/signup
document.addEventListener("click", e => {
  if (e.target && e.target.id === "toggleAuth") {
    e.preventDefault();
    isLogin = !isLogin;
    authTitle.textContent = isLogin ? "Login" : "Sign Up";
    authActionBtn.textContent = isLogin ? "Login" : "Sign Up";
    displayNameInput.style.display = isLogin ? "none" : "block";
    e.target.parentElement.innerHTML = isLogin
      ? `Don't have an account? <a href="#" id="toggleAuth">Sign up</a>`
      : `Already have an account? <a href="#" id="toggleAuth">Login</a>`;
  }
});

// Form submit
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;
  const displayName = displayNameInput.value;

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName });
    }
    window.location.href = "index.html";
  } catch (error) {
    alert("Authentication Error: " + error.message);
  }
});

// Google Login
googleLoginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "index.html";
  } catch (error) {
    alert("Google sign-in error: " + error.message);
  }
});

// If already logged in, redirect from login.html
onAuthStateChanged(auth, user => {
  if (user && window.location.pathname.includes("login")) {
    window.location.href = "index.html";
  }
});
