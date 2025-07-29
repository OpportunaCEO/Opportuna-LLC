import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

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

// Redirect to login if user is not authenticated
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// Logout button
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// Contact form submission
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

// Dropdown menu toggle on profile page (if needed)
const dropdownToggle = document.getElementById("dropdownToggle");
const dropdownMenu = document.getElementById("dropdownMenu");

if (dropdownToggle && dropdownMenu) {
  dropdownToggle.addEventListener("click", () => {
    dropdownMenu.classList.toggle("show");
  });
}
