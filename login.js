// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Firebase Config (Replace with your real config)
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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM elements
const loginForm = document.getElementById("loginForm");
const toggleAuth = document.getElementById("toggleAuth");
const authTitle = document.getElementById("authTitle");
const authBtn = document.getElementById("authActionBtn");
const displayNameInput = document.getElementById("displayName");
const googleBtn = document.getElementById("googleLoginBtn");

let isLogin = true;
let persistenceSet = false;

// Set persistence BEFORE any sign-in/sign-up
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    persistenceSet = true;
    console.log("Auth persistence set to local.");
  })
  .catch((error) => {
    console.error("Auth persistence error:", error);
    persistenceSet = false;
  });

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

  if (!persistenceSet) {
    alert("Auth persistence not yet set. Please wait and try again.");
    return;
  }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const displayName = displayNameInput.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html"; // redirect after login
    } else {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCred.user, { displayName });
      }
      // Save profile info to Firestore
      await setDoc(doc(db, "profiles", userCred.user.uid), {
        email,
        displayName: displayName || null,
        createdAt: serverTimestamp()
      });
      window.location.href = "index.html"; // redirect after signup
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Google Sign-In
googleBtn.addEventListener("click", async () => {
  if (!persistenceSet) {
    alert("Auth persistence not yet set. Please wait and try again.");
    return;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    // Optionally, you can check if new user and save profile to Firestore here if you want
    window.location.href = "index.html";
  } catch (error) {
    alert("Google Sign-in failed: " + error.message);
  }
});
