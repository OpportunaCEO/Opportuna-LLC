// assets/login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAFx0Ad-8RKji4cDNYWm1yPTkx4RpRwWM",
  authDomain: "opportuna-a14bb.firebaseapp.com",
  projectId: "opportuna-a14bb",
  storageBucket: "opportuna-a14bb.appspot.com",
  messagingSenderId: "906149069855",
  appId: "1:906149069855:web:618ed823248443db30812a",
  measurementId: "G-GJGCWL01W4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const displayNameInput = document.getElementById("displayName");
  const authTitle = document.getElementById("authTitle");
  const authActionBtn = document.getElementById("authActionBtn");
  const toggleAuthLink = document.getElementById("toggleAuth");
  const googleLoginBtn = document.getElementById("googleLoginBtn");

  let isLogin = true;

  // Toggle between Login and Signup modes
  document.body.addEventListener("click", (e) => {
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

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const displayName = displayNameInput.value.trim();

    if (!email || !password || (!isLogin && !displayName)) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      }
      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
    }
  });

  googleLoginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      window.location.href = "index.html";
    } catch (error) {
      alert("Google sign-in error: " + error.message);
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes("login")) {
      window.location.href = "index.html";
    }
  });
});
