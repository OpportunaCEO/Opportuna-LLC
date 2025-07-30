// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ✅ Firebase Config (Replace this with your real config)
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdefgh"
};

};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM elements
const loginForm = document.getElementById("loginForm");
const toggleAuth = document.getElementById("toggleAuth");
const authTitle = document.getElementById("authTitle");
const authBtn = document.getElementById("authActionBtn");
const displayNameInput = document.getElementById("displayName");
const googleBtn = document.getElementById("googleLoginBtn");

let isLogin = true;

// Toggle between login/signup
toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? "Login" : "Sign Up";
  authBtn.textContent = isLogin ? "Login" : "Sign Up";
  displayNameInput.style.display = isLogin ? "none" : "block";
});

// Handle login/signup
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const displayName = document.getElementById("displayName").value.trim();

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html"; // redirect to feed
    } else {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCred.user, { displayName });
      }
      window.location.href = "index.html";
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Google Sign-In
googleBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "index.html";
  } catch (error) {
    alert("Google Sign-in failed: " + error.message);
  }
});
