// Firebase imports
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

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBAFx0Ad-8RKji4cDNYWm1yPTkx4RpRwWM",
  authDomain: "opportuna-a14bb.firebaseapp.com",
  projectId: "opportuna-a14bb",
  storageBucket: "opportuna-a14bb.appspot.com",
  messagingSenderId: "906149069855",
  appId: "1:906149069855:web:618ed823248443db30812a",
  measurementId: "G-GJGCWL01W4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

window.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("loginLink");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  const navProfilePic = document.getElementById("navProfilePic");

  // 🔐 Handle auth state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      loginLink && (loginLink.style.display = "none");
      userDropdown && (userDropdown.style.display = "inline-block");
      navProfilePic && (navProfilePic.src = user.photoURL || "assets/default.png");

      // Load profile
      const docRef = doc(db, "profiles", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById("fullName").value = data.fullName || "";
        document.getElementById("bio").value = data.bio || "";
        document.getElementById("skills").value = data.skills || "";
        document.getElementById("experience").value = data.experience || "";
        if (data.photoURL) {
          const picPreview = document.getElementById("picPreview");
          picPreview.src = data.photoURL;
          picPreview.style.display = "block";
        }
      }

      // Initialize post and feed
      setupPostForm(user);
      loadFeed();

    } else {
      loginLink && (loginLink.style.display = "inline-block");
      userDropdown && (userDropdown.style.display = "none");
    }
  });

  // 🔓 Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  // 🔐 Login form (optional)
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]').value;
      const password = e.target.querySelector('input[type="password"]').value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "index.html";
      } catch (error) {
        alert("Login failed: " + error.message);
      }
    });
  }

  // 📩 Contact form (optional)
  const contactForm = document.getElementById("contactForm");
  const contactStatus = document.getElementById("contactStatus");
  if (contactForm && contactStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      contactStatus.textContent = "";

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !message) {
        contactStatus.style.color = "#ff4500";
        contactStatus.textContent = "Please fill in all fields.";
        return;
      }

      contactStatus.style.color = "#32cd32";
      contactStatus.textContent = "Thank you for contacting us!";
      contactForm.reset();
    });
  }

  // 💾 Save profile
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const saveBtn = document.getElementById("saveProfileBtn");
      const saveBtnText = document.getElementById("saveBtnText");
      const saveBtnSpinner = document.getElementById("saveBtnSpinner");

      saveBtn.disabled = true;
      saveBtnText.style.display = "none";
      saveBtnSpinner.style.display = "inline-block";

      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to save your profile.");
        return;
      }

      const fullName = document.getElementById("fullName").value.trim();
      const bio = document.getElementById("bio").value.trim();
      const skills = document.getElementById("skills").value.trim();
      const experience = document.getElementById("experience").value.trim();
      const profilePic = document.getElementById("profilePic").files[0];

      let photoURL = "";
      try {
        if (profilePic) {
          const picRef = ref(storage, `profilePictures/${user.uid}`);
          await uploadBytes(picRef, profilePic);
          photoURL = await getDownloadURL(picRef);
        }

        await setDoc(doc(db, "profiles", user.uid), {
          fullName,
          bio,
          skills,
          experience,
          photoURL
        });

        alert("Profile saved successfully!");
      } catch (error) {
        alert("Error saving profile: " + error.message);
      } finally {
        saveBtn.disabled = false;
        saveBtnText.style.display = "inline";
        saveBtnSpinner.style.display = "none";
      }
    });
  }

  // 📝 Create post
  function setupPostForm(user) {
    const postForm = document.getElementById("postForm");
    if (!postForm) return;

    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const postText = document.getElementById("postText").value.trim();
      if (!postText) return;

      try {
        await addDoc(collection(db, "posts"), {
          text: postText,
          authorUid: user.uid,
          authorName: user.displayName || "Anonymous",
          timestamp: serverTimestamp()
        });
        document.getElementById("postText").value = "";
      } catch (err) {
        alert("Error posting: " + err.message);
      }
    });
  }

  // 📰 Load feed
  function loadFeed() {
    const feedContainer = document.getElementById("feedContainer");
    if (!feedContainer) return;

    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
      feedContainer.innerHTML = "";
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

