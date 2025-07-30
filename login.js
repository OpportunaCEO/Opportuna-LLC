// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ✅ Firebase Config (Replace this with your real config)
const firebaseConfig = {
  apiKey: "AIzaSyBAFx0Ad-8RKji4cDNYWm1yPTkx4RpRwWM",
  authDomain: "opportuna-a14bb.firebaseapp.com",
  projectId: "opportuna-a14bb",
  storageBucket: "opportuna-a14bb.appspot.com",
  messagingSenderId: "906149069855",
  appId: "1:906149069855:web:618ed823248443db30812a",
  measurementId: "G-GJGCWL01W4"
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
  const displayName = displayNameInput.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    // Set persistence BEFORE sign-in or sign-up
    await setPersistence(auth, browserLocalPersistence);

    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html"; // redirect after login
    } else {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCred.user, { displayName });
      }
      window.location.href = "index.html"; // redirect after signup
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Google Sign-In
googleBtn.addEventListener("click", async () => {
  try {
    await setPersistence(auth, browserLocalPersistence); // also set persistence here
    await signInWithPopup(auth, provider);
    window.location.href = "index.html";
  } catch (error) {
    alert("Google Sign-in failed: " + error.message);
  }
});
