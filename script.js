import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

window.addEventListener('DOMContentLoaded', () => {
  const loginLink = document.getElementById("loginLink");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");
  const navProfilePic = document.getElementById("navProfilePic");

  onAuthStateChanged(auth, user => {
    if (user) {
      loginLink.style.display = "none";
      userDropdown.style.display = "inline-block";
      navProfilePic.src = user.photoURL || "assets/default.png";
    } else {
      loginLink.style.display = "inline-block";
      userDropdown.style.display = "none";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  // Login form logic (for login.html or modals if used here)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
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

  // Contact form submission (added from assets/script.js)
  const contactForm = document.getElementById("contactForm");
  const contactStatus = document.getElementById("contactStatus");

  if (contactForm && contactStatus) {
    contactForm.addEventListener("submit", e => {
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

      // Placeholder: Add real contact form submission logic here
      contactStatus.style.color = "#32cd32";
      contactStatus.textContent = "Thank you for contacting us! We'll get back to you shortly.";
      contactForm.reset();
    });
  }

  // Dropdown menu toggle on profile page (added from assets/script.js)
  const dropdownToggle = document.getElementById("dropdownToggle");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", () => {
      dropdownMenu.classList.toggle("show");
    });
  }
});
