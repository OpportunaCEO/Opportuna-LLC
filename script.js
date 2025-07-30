import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const storage = getStorage(app);

window.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("loginLink");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  const navProfilePic = document.getElementById("navProfilePic");

  const createPostBtn = document.getElementById("createPostBtn");
  const postModal = document.getElementById("postModal");
  const overlay = document.getElementById("overlay");
  const postSection = document.getElementById("postSection");
  const feedContainer = document.getElementById("feedContainer");
  const postForm = document.getElementById("postForm");
  const postContent = document.getElementById("postContent");
  const jobsCountEl = document.getElementById("jobsCount");
  const employersCountEl = document.getElementById("employersCount");
  const usersCountEl = document.getElementById("usersCount");


  // Auth state changes
  onAuthStateChanged(auth, async (user) => {
    loadQuickStats();
    if (user) {
      loginLink.style.display = "none";
      userDropdown.style.display = "inline-block";
      navProfilePic.src = user.photoURL || "assets/default.png";

      createPostBtn.style.display = "block";

      // Show post modal on button click
      createPostBtn.onclick = () => {
        postModal.style.display = "block";
        overlay.style.display = "block";
      };

      // Hide modal when clicking overlay
      overlay.onclick = () => {
        postModal.style.display = "none";
        overlay.style.display = "none";
      };

      async function loadQuickStats() {
  try {
    // Count jobs
    const jobsSnapshot = await getDocs(collection(db, "jobs"));
    jobsCountEl.textContent = jobsSnapshot.size;

    // Count employers
    const employersSnapshot = await getDocs(collection(db, "employers"));
    employersCountEl.textContent = employersSnapshot.size;

    // Count users
    const usersSnapshot = await getDocs(collection(db, "users"));
    usersCountEl.textContent = usersSnapshot.size;
  } catch (err) {
    console.error("Failed to load quick stats:", err);
  }
}


      // Load posts
      loadFeed();

    } else {
      loginLink.style.display = "inline-block";
      userDropdown.style.display = "none";
      createPostBtn.style.display = "none";
      postModal.style.display = "none";
      overlay.style.display = "none";
      feedContainer.innerHTML = "<p>Please log in to see posts.</p>";
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  // Post submission
  if (postForm) {
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to post.");
        return;
      }
      const text = postContent.value.trim();
      if (!text) return;

      try {
        await addDoc(collection(db, "posts"), {
          text,
          authorUid: user.uid,
          authorName: user.displayName || "Anonymous",
          timestamp: serverTimestamp()
        });
        postContent.value = "";
        postModal.style.display = "none";
        overlay.style.display = "none";
      } catch (err) {
        alert("Failed to post: " + err.message);
      }
    });
  }

  // Load and display posts in feed
  function loadFeed() {
    if (!feedContainer) return;

    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
      feedContainer.innerHTML = "";
      if (snapshot.empty) {
        feedContainer.innerHTML = "<p>No posts yet. Be the first to post!</p>";
        return;
      }

      snapshot.forEach((doc) => {
        const post = doc.data();
        const div = document.createElement("div");
        div.className = "post-card";
        div.innerHTML = `
          <p><strong>${post.authorName}</strong></p>
          <p>${post.text}</p>
          <small>${post.timestamp?.toDate().toLocaleString() || ""}</small>
          <hr />
        `;
        feedContainer.appendChild(div);
      });
    });
  }
});
