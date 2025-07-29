import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Corrected Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAFx0Ad-8RKji4cDNYWm1yPTkx4RpRwWM",
  authDomain: "opportuna-a14bb.firebaseapp.com",
  projectId: "opportuna-a14bb",
  storageBucket: "opportuna-a14bb.appspot.com", // FIXED HERE
  messagingSenderId: "906149069855",
  appId: "1:906149069855:web:618ed823248443db30812a",
  measurementId: "G-GJGCWL01W4"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM
const createPostBtn = document.getElementById("createPostBtn");
const overlay = document.getElementById("overlay");
const postModal = document.getElementById("postModal");
const postForm = document.getElementById("postForm");
const postSection = document.getElementById("postSection");
const authModal = document.getElementById("authModal");
const authOverlay = document.getElementById("authOverlay");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const authForm = document.getElementById("authForm");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authBack = document.getElementById("authBack");
const authError = document.getElementById("authError");
const logoutBtn = document.getElementById("logoutBtn");
const navProfilePic = document.getElementById("navProfilePic");
const userDropdown = document.getElementById("userDropdown");

// Show post modal
createPostBtn.addEventListener("click", () => {
  overlay.classList.add("show");
  postModal.classList.add("open");
});

overlay.addEventListener("click", () => {
  overlay.classList.remove("show");
  postModal.classList.remove("open");
});

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = document.getElementById("postContent").value.trim();
  const user = auth.currentUser;
  if (user && content) {
    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      email: user.email,
      content,
      timestamp: serverTimestamp()
    });
    postForm.reset();
    overlay.classList.remove("show");
    postModal.classList.remove("open");
  }
});

// Auth modal
signInBtn.addEventListener("click", () => {
  authForm.style.display = "flex";
  authSubmitBtn.textContent = "Sign In";
});

signUpBtn.addEventListener("click", () => {
  authForm.style.display = "flex";
  authSubmitBtn.textContent = "Sign Up";
});

authBack.addEventListener("click", () => {
  authForm.style.display = "none";
  authError.textContent = "";
});

// Auth submit
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;
  try {
    if (authSubmitBtn.textContent === "Sign In") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    authModal.classList.remove("open");
    authOverlay.classList.remove("show");
  } catch (error) {
    authError.textContent = error.message;
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    createPostBtn.style.display = "block";
    userDropdown.style.display = "block";
    navProfilePic.src = "assets/default.png"; // You could use user.photoURL if available
    authModal.classList.remove("open");
    authOverlay.classList.remove("show");

    // Load posts
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
      postSection.innerHTML = "";
      snapshot.forEach((doc) => {
        const post = doc.data();
        const postEl = document.createElement("div");
        postEl.className = "post-card";
        postEl.innerHTML = `
          <div class="post-header">
            <img class="post-avatar" src="assets/default.png" />
            <strong>${post.email}</strong>
          </div>
          <div class="post-content">${post.content}</div>
        `;
        postSection.appendChild(postEl);
      });
    });
  } else {
    // User is signed out
    createPostBtn.style.display = "none";
    userDropdown.style.display = "none";
    authForm.style.display = "none";
    authModal.classList.add("open");
    authOverlay.classList.add("show");
  }
});

// === Dropdown Toggle Behavior ===
if (userDropdown && navProfilePic) {
  navProfilePic.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    userDropdown.classList.remove("open");
  });
}
