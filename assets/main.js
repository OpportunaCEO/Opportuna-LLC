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
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
  serverTimestamp,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ✅ Corrected Firebase configuration
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBAFx0Ad-8RKji4cDNYWm1yPTkx4RpRwWM",
  authDomain: "opportuna-a14bb.firebaseapp.com",
  projectId: "opportuna-a14bb",
  storageBucket: "opportuna-a14bb.appspot.com", // FIXED HERE
  storageBucket: "opportuna-a14bb.appspot.com",
  messagingSenderId: "906149069855",
  appId: "1:906149069855:web:618ed823248443db30812a",
  measurementId: "G-GJGCWL01W4"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM
// DOM elements
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
const loginLink = document.getElementById("loginLink");
const navProfilePic = document.getElementById("navProfilePic");
const userDropdown = document.getElementById("userDropdown");
const myProfileBtn = document.getElementById("myProfileBtn");

// Profile modal
const profileModal = document.getElementById("profileModal");
const profileOverlay = document.getElementById("profileOverlay");
const profileForm = document.getElementById("profileForm");
const profilePicInput = document.getElementById("profilePicInput");
const bioInput = document.getElementById("bioInput");
const workInput = document.getElementById("workInput");
const skillsInput = document.getElementById("skillsInput");

// Search
const userSearchInput = document.getElementById("userSearchInput");
const userSearchResults = document.getElementById("userSearchResults");

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
// Auth modal logic
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
// Load and display posts
function loadPosts() {
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  onSnapshot(q, async (snapshot) => {
    postSection.innerHTML = "";
    for (const docSnap of snapshot.docs) {
      const post = docSnap.data();
      const userProfileRef = doc(db, "profiles", post.uid);
      const userProfileSnap = await getDoc(userProfileRef);
      const userData = userProfileSnap.exists() ? userProfileSnap.data() : {};
      const postEl = document.createElement("div");
      postEl.className = "post-card";
      postEl.innerHTML = `
        <div class="post-header">
          <img class="post-avatar" src="${userData.photoURL || 'assets/default.png'}" />
          <strong>${post.email}</strong>
          <p class="post-bio">${userData.bio || ""}</p>
        </div>
        <div class="post-content">${post.content}</div>
      `;
      postSection.appendChild(postEl);
    }
  });
}

// Auth state change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    loginLink.style.display = "none"; // Hide login link if logged in
    createPostBtn.style.display = "block";
    userDropdown.style.display = "block";
    loginLink.style.display = "none";  // ADD THIS
    navProfilePic.src = "assets/default.png"; // or user.photoURL if you have it

    authModal.classList.remove("open");
    authOverlay.classList.remove("show");

    // Load posts (your existing code)
    // ...

    loadUserProfile();
    loadPosts();
  } else {
    // User is signed out
    loginLink.style.display = "inline-block"; // Show login link if logged out
    createPostBtn.style.display = "none";
    userDropdown.style.display = "none";
    loginLink.style.display = "inline-block"; // ADD THIS

    authForm.style.display = "none";
    authModal.classList.add("open");
    authOverlay.classList.add("show");
  }
});

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
    loadUserProfile();
    loadPosts();
  } else {
    // User is signed out
    createPostBtn.style.display = "none";
    userDropdown.style.display = "none";
    authForm.style.display = "none";
    authModal.classList.add("open");
    authOverlay.classList.add("show");
  }
});

// Profile modal logic
myProfileBtn.addEventListener("click", () => {
  profileOverlay.classList.add("show");
  profileModal.classList.add("open");
  loadUserProfile();
});

profileOverlay.addEventListener("click", () => {
  profileOverlay.classList.remove("show");
  profileModal.classList.remove("open");
});

async function loadUserProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const snapshot = await getDoc(doc(db, "profiles", user.uid));
  if (snapshot.exists()) {
    const data = snapshot.data();
    bioInput.value = data.bio || "";
    workInput.value = data.work || "";
    skillsInput.value = data.skills || "";
    if (data.photoURL) {
      navProfilePic.src = data.photoURL;
    }
  }
}

// Save profile
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  let photoURL = null;
  const file = profilePicInput.files[0];
  if (file) {
    const storageRef = ref(storage, `profilePics/${user.uid}`);
    await uploadBytes(storageRef, file);
    photoURL = await getDownloadURL(storageRef);
    navProfilePic.src = photoURL;
  }

  await setDoc(doc(db, "profiles", user.uid), {
    bio: bioInput.value.trim(),
    work: workInput.value.trim(),
    skills: skillsInput.value.trim(),
    photoURL
  });

  profileOverlay.classList.remove("show");
  profileModal.classList.remove("open");
  loadPosts();
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

// === User Search ===
userSearchInput.addEventListener("input", async () => {
  const search = userSearchInput.value.trim().toLowerCase();
  userSearchResults.innerHTML = "";
  if (!search) return;

  const profilesSnapshot = await getDocs(collection(db, "profiles"));
  profilesSnapshot.forEach((doc) => {
    const data = doc.data();
    const emailMatch = data?.email?.toLowerCase().includes(search);
    const skillMatch = data?.skills?.toLowerCase().includes(search);
    if (emailMatch || skillMatch) {
      const result = document.createElement("div");
      result.className = "user-result";
      result.innerHTML = `
        <img src="${data.photoURL || 'assets/default.png'}" class="result-avatar"/>
        <div>
          <strong>${data.email || 'Unknown'}</strong><br/>
          <em>${data.skills || ''}</em>
        </div>
      `;
      userSearchResults.appendChild(result);
    }
  });
});
