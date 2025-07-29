// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-_wEzEbFST5NfI6PbmngG0emHwR-ot9k",
  authDomain: "opportuna-34ac6.firebaseapp.com",
  projectId: "opportuna-34ac6",
  storageBucket: "opportuna-34ac6.appspot.com",
  messagingSenderId: "373706197348",
  appId: "1:373706197348:web:3793cfd8d33b2db59f5a89"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI references
const postSection = document.getElementById("postSection");
const postForm = document.getElementById("postForm");
const postContent = document.getElementById("postContent");
const createPostBtn = document.getElementById("createPostBtn");
const postModal = document.getElementById("postModal");
const overlay = document.getElementById("overlay");
const logoutBtn = document.getElementById("logoutBtn");
const userDropdown = document.getElementById("userDropdown");
const navProfilePic = document.getElementById("navProfilePic");
const viewProfile = document.getElementById("viewProfile");

// Auth UI
const authOverlay = document.getElementById("authOverlay");
const authModal = document.getElementById("authModal");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const authForm = document.getElementById("authForm");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authBack = document.getElementById("authBack");
const authError = document.getElementById("authError");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

let currentUser = null;

// Auth state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    authOverlay.classList.remove("show");
    authModal.classList.remove("open");
    userDropdown.style.display = "block";
    createPostBtn.style.display = "block";

    const profileDoc = await getDoc(doc(db, "profiles", user.uid));
    const avatar = profileDoc.exists() ? profileDoc.data().avatar || "assets/default.png" : "assets/default.png";
    navProfilePic.src = avatar;

    viewProfile.href = `profile.html?uid=${user.uid}`;
    loadPosts();
  } else {
    currentUser = null;
    authOverlay.classList.add("show");
    authModal.classList.add("open");
    userDropdown.style.display = "none";
    createPostBtn.style.display = "none";
  }
});

// Auth handling
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

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    if (authSubmitBtn.textContent === "Sign In") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    authError.textContent = err.message;
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// Post logic
function loadPosts() {
  const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  onSnapshot(postsQuery, (snapshot) => {
    postSection.innerHTML = "";
    snapshot.forEach((doc) => {
      const post = doc.data();
      const postElement = document.createElement("div");
      postElement.className = "post-card";
      postElement.innerHTML = `
        <div class="post-header">
          <img src="${post.avatar || "assets/default.png"}" class="post-avatar" />
          <div>
            <strong>${post.name || "User"}</strong>
            <div style="font-size:0.85rem; color:gray;">${new Date(post.timestamp?.toDate()).toLocaleString()}</div>
          </div>
          ${currentUser && post.uid === currentUser.uid ? `
            <div class="post-actions">
              <button class="edit-btn" data-id="${doc.id}">Edit</button>
              <button class="delete-btn" data-id="${doc.id}">Delete</button>
            </div>` : ""}
        </div>
        <div class="post-content">${post.content}</div>
      `;
      postSection.appendChild(postElement);
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const postData = docSnap.data();
          postContent.value = postData.content;
          postModal.classList.add("open");
          overlay.classList.add("show");

          postForm.onsubmit = async (e) => {
            e.preventDefault();
            await updateDoc(docRef, {
              content: postContent.value,
              timestamp: new Date()
            });
            postModal.classList.remove("open");
            overlay.classList.remove("show");
            postForm.reset();
          };
        }
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await deleteDoc(doc(db, "posts", id));
      });
    });
  });
}

createPostBtn.addEventListener("click", () => {
  postModal.classList.add("open");
  overlay.classList.add("show");
});

overlay.addEventListener("click", () => {
  postModal.classList.remove("open");
  overlay.classList.remove("show");
  postForm.reset();
});

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  await addDoc(collection(db, "posts"), {
    content: postContent.value,
    uid: currentUser.uid,
    name: currentUser.email,
    avatar: navProfilePic.src,
    timestamp: new Date()
  });
  postModal.classList.remove("open");
  overlay.classList.remove("show");
  postForm.reset();
});
