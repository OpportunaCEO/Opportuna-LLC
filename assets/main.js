// Firebase imports and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhxKUyL4OV08tIEsT34vAeTiRWJblSnww",
  authDomain: "opportuna-a14bb.firebaseapp.com",
  projectId: "opportuna-a14bb",
  storageBucket: "opportuna-a14bb.appspot.com",
  messagingSenderId: "8746576546",
  appId: "1:8746576546:web:f37e179e04f7dcf4cd670f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const userDropdown = document.getElementById("userDropdown");
const navProfilePic = document.getElementById("navProfilePic");
const profileLink = document.getElementById("profileLink");

// Modal elements
const profileModalHTML = `
  <div id="profileModal" class="modal">
    <h2>Edit Profile</h2>
    <form id="profileForm">
      <label for="profilePic">Profile Picture</label>
      <input type="file" id="profilePic" accept="image/*" />

      <label for="bio">Bio</label>
      <textarea id="bio"></textarea>

      <label for="experience">Work Experience</label>
      <textarea id="experience"></textarea>

      <label for="skills">Skills (comma-separated)</label>
      <input type="text" id="skills" />

      <button type="submit">Save</button>
    </form>
  </div>
  <style>
    #profileModal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      z-index: 1300;
    }
    #profileModal label {
      display: block;
      margin-top: 1rem;
    }
    #profileModal input,
    #profileModal textarea {
      width: 100%;
      margin-top: 0.25rem;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #ccc;
    }
    #profileModal button {
      margin-top: 1.5rem;
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
    }
  </style>
`;
document.body.insertAdjacentHTML("beforeend", profileModalHTML);

const profileModal = document.getElementById("profileModal");
const profileForm = document.getElementById("profileForm");
const profilePicInput = document.getElementById("profilePic");
const bioInput = document.getElementById("bio");
const expInput = document.getElementById("experience");
const skillsInput = document.getElementById("skills");

let currentUser = null;

onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    userDropdown.style.display = "inline-block";

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.photoURL) navProfilePic.src = data.photoURL;
    }
  } else {
    currentUser = null;
    userDropdown.style.display = "none";
  }
});

profileLink.addEventListener("click", async () => {
  if (!currentUser) return;

  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    bioInput.value = data.bio || "";
    expInput.value = data.experience || "";
    skillsInput.value = data.skills || "";
  }
  profileModal.style.display = "block";
});

profileForm.addEventListener("submit", async e => {
  e.preventDefault();

  const bio = bioInput.value;
  const experience = expInput.value;
  const skills = skillsInput.value;

  const userRef = doc(db, "users", currentUser.uid);
  await updateDoc(userRef, { bio, experience, skills });

  const file = profilePicInput.files[0];
  if (file) {
    const storageRef = ref(storage, `profilePics/${currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(userRef, { photoURL: url });
    navProfilePic.src = url;
  }

  profileModal.style.display = "none";
});
