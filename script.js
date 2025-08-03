import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
  serverTimestamp,
  getDocs,
  deleteDoc
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

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      loginLink.style.display = "none";
      userDropdown.style.display = "inline-block";
      navProfilePic.src = user.photoURL || "assets/default.png";
      createPostBtn.style.display = "block";

      createPostBtn.onclick = () => {
        postModal.style.display = "block";
        overlay.style.display = "block";
      };

      overlay.onclick = () => {
        postModal.style.display = "none";
        overlay.style.display = "none";
      };

      try {
        const jobsSnapshot = await getDocs(collection(db, "jobs"));
        jobsCountEl.textContent = jobsSnapshot.size;

        const employersSnapshot = await getDocs(collection(db, "employers"));
        employersCountEl.textContent = employersSnapshot.size;

        const usersSnapshot = await getDocs(collection(db, "users"));
        usersCountEl.textContent = usersSnapshot.size;
      } catch (err) {
        console.error("Failed to load quick stats:", err);
      }

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

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

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
        authorPhoto: user.photoURL || null,
        timestamp: serverTimestamp()
      });

      postContent.value = "";
      postModal.style.display = "none";
      overlay.style.display = "none";
    } catch (err) {
      console.error("Failed to post:", err);
      alert("Failed to post: " + err.message);
    }
  });
}

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

      snapshot.forEach((docSnap) => {
        const post = docSnap.data();
        const postId = docSnap.id;

        const div = document.createElement("div");
        div.className = "post-card";

        const isOwner = auth.currentUser && post.authorUid === auth.currentUser.uid;

        div.innerHTML = `
          <div class="post-header">
            <img src="${post.authorPhoto || 'assets/default.png'}" alt="avatar" class="post-avatar" />
            <div class="post-meta">
              <strong>${post.authorName}</strong><br />
              <small>${post.timestamp?.toDate().toLocaleString() || ""}</small>
            </div>
          </div>
          <div class="post-content">${post.text}</div>
          ${isOwner ? `<button class="delete-btn" data-id="${postId}">Delete</button>` : ""}
        `;

        if (isOwner) {
          const deleteBtn = div.querySelector(".delete-btn");
          deleteBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to delete this post?")) {
              try {
                await deleteDoc(doc(db, "posts", postId));
              } catch (err) {
                alert("Failed to delete post: " + err.message);
              }
            }
          });
        }

        feedContainer.appendChild(div);
      });
    });
  }
});
