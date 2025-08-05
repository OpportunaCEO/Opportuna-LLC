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
const postForm = document.getElementById("post-form");
const postText = document.getElementById("post-text");
const postsContainer = document.getElementById("posts-container");
const logoutBtn = document.getElementById("logout-btn");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signup-form");
const loginPopup = document.getElementById("login-popup");
const signupPopup = document.getElementById("signup-popup");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const closeBtns = document.querySelectorAll(".close-popup");
const quickStats = document.getElementById("quick-stats");
const jobSearchForm = document.getElementById("job-search-form");
const jobSearchInput = document.getElementById("job-search-input");
const recommendedJobsContainer = document.getElementById("recommended-jobs");

// Safe event binding for post deletion
if (postsContainer) {
  postsContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-post")) {
      const id = e.target.getAttribute("data-id");
      await deleteDoc(doc(db, "posts", id));
    }
  });
}

// Safe fetch calls only when user is logged in AND elements exist
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (postsContainer) fetchPosts();
    if (recommendedJobsContainer) fetchRecommendedJobs();
  }
});


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

// ----------------- Delete Post -----------------
postsContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-post")) {
    const id = e.target.getAttribute("data-id");
    await deleteDoc(doc(db, "posts", id));
  }
});

// ----------------- Login/Signup -----------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      loginPopup.style.display = "none";
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
      signupPopup.style.display = "none";
    } catch (err) {
      alert(err.message);
    }
  });
}

// ----------------- Logout -----------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth);
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
