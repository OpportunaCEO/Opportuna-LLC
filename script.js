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
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ----------------- Firebase Config -----------------
const firebaseConfig = {
  apiKey: "AIzaSyCWaZjkNf4vl7nIjzvh7ozqZ4hzXgKzXlw",
  authDomain: "opportuna-1f413.firebaseapp.com",
  projectId: "opportuna-1f413",
  storageBucket: "opportuna-1f413.appspot.com",
  messagingSenderId: "878040672922",
  appId: "1:878040672922:web:fe7cc558705fdb0f8e3dc5"
};

// ----------------- Firebase Initialization -----------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ----------------- DOM Elements -----------------
const postForm = document.getElementById("postForm");
const postText = document.getElementById("postText");
const postsContainer = document.getElementById("postsContainer");

// === NEW DOM ELEMENTS FOR AUTH UI
const loginLink = document.getElementById("loginLink");          // Login nav link
const userDropdown = document.getElementById("userDropdown");    // Profile dropdown container
const logoutBtn = document.getElementById("logoutBtn");          // Logout button/link

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginPopup = document.getElementById("loginPopup");
const signupPopup = document.getElementById("signupPopup");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const closeBtns = document.querySelectorAll(".closePopup");
const quickStats = document.getElementById("quickStats");
const jobSearchForm = document.getElementById("jobSearchForm");
const jobSearchInput = document.getElementById("jobSearchInput");
const recommendedJobsContainer = document.getElementById("recommendedJobs");

// ----------------- Safe event binding for post deletion -----------------
if (postsContainer) {
  postsContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-post")) {
      const id = e.target.getAttribute("data-id");
      await deleteDoc(doc(db, "posts", id));
    }
  });
}

// ----------------- Auth State Listener and UI Update -----------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User logged in: show profile dropdown, hide login link
    if (loginLink) loginLink.style.display = "none";
    if (userDropdown) userDropdown.style.display = "block";

    // Fetch posts and recommended jobs only if containers exist
    if (postsContainer) fetchPosts();
    if (recommendedJobsContainer) fetchRecommendedJobs();
  } else {
    // User NOT logged in: show login link, hide profile dropdown
    if (loginLink) loginLink.style.display = "block";
    if (userDropdown) userDropdown.style.display = "none";
  }
});

// ----------------- Logout Button -----------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        window.location.href = "login.html"; // Redirect after logout
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  });
}

// ----------------- Post Creation -----------------
if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = postText.value.trim();
    const user = auth.currentUser;
    if (text && user) {
      await addDoc(collection(db, "posts"), {
        text,
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
      });
      postText.value = "";
    }
  });
}

// ----------------- Real-time Feed -----------------
function fetchPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const post = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("post-card");
      div.innerHTML = `
        <p>${post.text}</p>
        <small>By: ${post.email || "Unknown"}</small>
        <button data-id="${docSnap.id}" class="delete-post">Delete</button>
      `;
      postsContainer.appendChild(div);
    });
  });
}

// ----------------- Login/Signup Popup Handlers -----------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (loginPopup) loginPopup.style.display = "none";
    } catch (err) {
      alert(err.message);
    }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signupForm["signup-email"].value;
    const password = signupForm["signup-password"].value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (signupPopup) signupPopup.style.display = "none";
    } catch (err) {
      alert(err.message);
    }
  });
}

// ----------------- Job Search & Recommendations -----------------
if (jobSearchForm) {
  jobSearchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const queryText = jobSearchInput.value.toLowerCase().trim();
    fetchRecommendedJobs(queryText);
  });
}

async function fetchRecommendedJobs(queryFilter = "") {
  recommendedJobsContainer.innerHTML = "";
  const jobsSnapshot = await getDocs(collection(db, "jobs"));
  jobsSnapshot.forEach((docSnap) => {
    const job = docSnap.data();
    if (
      queryFilter === "" ||
      job.title.toLowerCase().includes(queryFilter) ||
      job.description.toLowerCase().includes(queryFilter)
    ) {
      const jobCard = document.createElement("div");
      jobCard.classList.add("job-card");
      jobCard.innerHTML = `
        <h4>${job.title}</h4>
        <p>${job.description}</p>
        <small>${job.location || "Remote"}</small>
      `;
      recommendedJobsContainer.appendChild(jobCard);
    }
  });
}

