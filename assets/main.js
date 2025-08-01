// ----------------- Firebase Imports -----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ----------------- Firebase Config -----------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------- DOM Elements -----------------
const postForm = document.getElementById("postForm");
const postInput = document.getElementById("postInput");
const postSection = document.getElementById("postSectionContent"); // updated to match HTML div
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const logoutBtn = document.getElementById("logoutBtn");

// ----------------- Auth State -----------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadPosts();
    document.body.classList.add("logged-in");
  } else {
    document.body.classList.remove("logged-in");
  }
});

// ----------------- Login -----------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm["loginEmail"].value;
    const password = loginForm["loginPassword"].value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
}

// ----------------- Signup -----------------
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signupForm["signupEmail"].value;
    const password = signupForm["signupPassword"].value;
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "profiles", userCred.user.uid), {
        email,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  });
}

// ----------------- Logout -----------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth);
  });
}

// ----------------- Post Submit -----------------
if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    const content = postInput.value.trim();
    if (!content) return;

    try {
      await addDoc(collection(db, "posts"), {
        uid: user.uid,
        email: user.email,
        content,
        timestamp: serverTimestamp(),
      });
      postInput.value = "";
    } catch (err) {
      console.error("Error posting:", err);
    }
  });
}

// ----------------- Load Posts -----------------
function loadPosts() {
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  onSnapshot(q, async (snapshot) => {
    postSection.innerHTML = "";
    for (const docSnap of snapshot.docs) {
      const post = docSnap.data();
      const postId = docSnap.id;
      const userProfileRef = doc(db, "profiles", post.uid);
      const userProfileSnap = await getDoc(userProfileRef);
      const userData = userProfileSnap.exists() ? userProfileSnap.data() : {};

      const isOwner = auth.currentUser && post.uid === auth.currentUser.uid;

      const postEl = document.createElement("div");
      postEl.className = "post-card";
      postEl.innerHTML = `
        <div class="post-header">
          <img class="post-avatar" src="${userData.photoURL || 'assets/default.png'}" />
          <strong>${post.email}</strong>
          <p class="post-bio">${userData.bio || ""}</p>
          ${isOwner ? `<button class="delete-post" data-id="${postId}">Delete</button>` : ""}
        </div>
        <div class="post-content">${post.content}</div>
      `;
      postSection.appendChild(postEl);
    }

    document.querySelectorAll(".delete-post").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const postId = e.target.getAttribute("data-id");
        if (postId && confirm("Are you sure you want to delete this post?")) {
          try {
            await deleteDoc(doc(db, "posts", postId));
          } catch (error) {
            console.error("Failed to delete post:", error);
            alert("You can only delete your own posts.");
          }
        }
      });
    });
  });
}
