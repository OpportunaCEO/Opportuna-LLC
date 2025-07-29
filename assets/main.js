// ----------------- Firebase Imports -----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ----------------- Firebase Config -----------------
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
const db = getFirestore(app);

// ----------------- UI Elements -----------------
const authModal = document.getElementById("authModal");
const authOverlay = document.getElementById("authOverlay");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const authForm = document.getElementById("authForm");
const authChoiceButtons = document.getElementById("authChoiceButtons");
const authBack = document.getElementById("authBack");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authError = document.getElementById("authError");

const navProfilePic = document.getElementById("navProfilePic");
const userDropdown = document.getElementById("userDropdown");
const logoutBtn = document.getElementById("logoutBtn");
const createPostBtn = document.getElementById("createPostBtn");
const postModal = document.getElementById("postModal");
const overlay = document.getElementById("overlay");
const postForm = document.getElementById("postForm");
const postContent = document.getElementById("postContent");
const postSection = document.getElementById("postSection");

let isSignUp = false;

// ----------------- Navigation & UI Helpers -----------------
function showAuthModal(signUp = false) {
  isSignUp = signUp;
  authModal.classList.add("open");
  authOverlay.classList.add("show");
  authError.textContent = "";
  authForm.style.display = "flex";
  authChoiceButtons.style.display = "none";
  authSubmitBtn.textContent = signUp ? "Sign Up" : "Sign In";
  emailInput.value = "";
  passwordInput.value = "";
}

function hideAuthModal() {
  authModal.classList.remove("open");
  authOverlay.classList.remove("show");
  authForm.style.display = "none";
  authChoiceButtons.style.display = "flex";
  authError.textContent = "";
}

// ----------------- Event Listeners -----------------
signInBtn.addEventListener("click", () => showAuthModal(false));
signUpBtn.addEventListener("click", () => showAuthModal(true));
authOverlay.addEventListener("click", hideAuthModal);

if (authBack) {
  authBack.addEventListener("click", () => {
    authForm.style.display = "none";
    authChoiceButtons.style.display = "flex";
    authError.textContent = "";
  });
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    if (isSignUp) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: email.split("@")[0] });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    hideAuthModal();
  } catch (error) {
    authError.textContent = error.message;
  }
});

onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed:", user);
  if (user) {
    userDropdown.style.display = "inline-block";
    createPostBtn.style.display = "inline-block";
    navProfilePic.src = user.photoURL || "assets/default.png";
    listenForPosts();
  } else {
    userDropdown.style.display = "none";
    createPostBtn.style.display = "none";
    navProfilePic.src = "assets/default.png";
    showAuthModal(false);
    postSection.innerHTML = ""; // Clear posts when signed out
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

createPostBtn.addEventListener("click", () => {
  postModal.classList.add("open");
  overlay.classList.add("show");
  postContent.focus();
});

overlay.addEventListener("click", () => {
  postModal.classList.remove("open");
  overlay.classList.remove("show");
});

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = postContent.value.trim();
  if (!content) return;

  const user = auth.currentUser;
  if (!user) {
    alert("You must be signed in to post.");
    return;
  }

  try {
    await addDoc(collection(db, "posts"), {
      content,
      name: user.displayName || "Unnamed",
      avatar: user.photoURL || "assets/default.png",
      authorUid: user.uid,
      timestamp: serverTimestamp(),
      likes: 0,
      comments: []
    });
    postContent.value = "";
    postModal.classList.remove("open");
    overlay.classList.remove("show");
  } catch (err) {
    console.error("Error posting:", err);
    alert("Failed to post.");
  }
});

// ----------------- Listen for Posts and Render -----------------
function listenForPosts() {
  const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  onSnapshot(postsQuery, (snapshot) => {
    postSection.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const p = docSnap.data();
      const postDiv = document.createElement("div");
      postDiv.className = "post-card";

      let buttonsHTML = "";
      if (auth.currentUser && p.authorUid === auth.currentUser.uid) {
        buttonsHTML = `
          <button class="edit-btn" data-id="${docSnap.id}">Edit</button>
          <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
        `;
      }

      postDiv.innerHTML = `
        <div class="post-header">
          <img class="post-avatar" src="${p.avatar || "assets/default.png"}" alt="avatar" />
          <strong>${p.name}</strong>
          <small>${p.timestamp?.toDate ? p.timestamp.toDate().toLocaleString() : ""}</small>
          <div class="post-actions">${buttonsHTML}</div>
        </div>
        <p class="post-content"></p>
      `;

      postDiv.querySelector(".post-content").textContent = p.content;
      postSection.appendChild(postDiv);
    });

    // Edit button handlers
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const postId = e.target.dataset.id;
        const postDocRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postDocRef);
        const postData = postDoc.data();

        const newContent = prompt("Edit your post:", postData.content);
        if (newContent !== null && newContent.trim() !== "") {
          await updateDoc(postDocRef, { content: newContent.trim() });
        }
      });
    });

    // Delete button handlers
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const postId = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this post?")) {
          await deleteDoc(doc(db, "posts", postId));
        }
      });
    });
  });
}
