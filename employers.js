// ======= Firebase SDK imports =======
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, query, orderBy, onSnapshot, where, deleteDoc, doc, setDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ======= Your Firebase config =======
const firebaseConfig = {
  apiKey: "AIzaSyBAFx0Ad-8RKji4cDNYWm1yPTkx4RpRwWM",
  authDomain: "opportuna-a14bb.firebaseapp.com",
  projectId: "opportuna-a14bb",
  storageBucket: "opportuna-a14bb.appspot.com",
  messagingSenderId: "906149069855",
  appId: "1:906149069855:web:618ed823248443db30812a",
  measurementId: "G-GJGCWL01W4"
};

// ======= Initialize Firebase =======
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ======= DOM references =======
const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");
const signOutBtn = document.getElementById("signOutBtn");
const signInStatus = document.getElementById("signInStatus");
const jobPostForm = document.getElementById("jobPostForm");
const jobListings = document.getElementById("jobListings");

const showSignUpBtn = document.getElementById("showSignUp");
const showSignInBtn = document.getElementById("showSignIn");

const dashboardSection = document.getElementById("dashboardSection");
const authSection = document.getElementById("authSection");

const companyNameInput = document.getElementById("companyName");
const companyBioInput = document.getElementById("companyBio");
const companyWebsiteInput = document.getElementById("companyWebsite");
const saveProfileBtn = document.getElementById("saveCompanyProfile");

// ======= Toggle sign-up / sign-in form views =======
showSignUpBtn.addEventListener("click", e => {
  e.preventDefault();
  signInForm.style.display = "none";
  signUpForm.style.display = "block";
  signInStatus.textContent = "";
});

showSignInBtn.addEventListener("click", e => {
  e.preventDefault();
  signUpForm.style.display = "none";
  signInForm.style.display = "block";
  signInStatus.textContent = "";
});

// ======= Update UI on sign-in =======
async function updateUIOnSignIn(user) {
  signInStatus.textContent = `Signed in as: ${user.email}`;
  signOutBtn.style.display = "inline-block";
  signInForm.style.display = "none";
  signUpForm.style.display = "none";
  jobPostForm.style.display = "block";
  dashboardSection.style.display = "block";
  authSection.style.display = "none";
  await loadCompanyProfile(user.uid);
  loadEmployerJobs(user.email);
}

// ======= Reset UI on sign-out =======
function resetUIOnSignOut() {
  signInStatus.textContent = "";
  signOutBtn.style.display = "none";
  signInForm.style.display = "block";
  signUpForm.style.display = "none";
  jobPostForm.style.display = "none";
  dashboardSection.style.display = "none";
  authSection.style.display = "block";
  jobListings.innerHTML = `<p>Please sign in to view your job listings.</p>`;
  companyNameInput.value = "";
  companyBioInput.value = "";
  companyWebsiteInput.value = "";
}

// ======= Sign Up Handler =======
signUpForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("signUpEmail").value.trim();
  const password = document.getElementById("signUpPassword").value.trim();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created! You are now signed in.");
    updateUIOnSignIn(userCredential.user);
    signUpForm.reset();
  } catch (error) {
    alert("Error creating account: " + error.message);
  }
});

// ======= Sign In Handler =======
signInForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("companyEmail").value.trim();
  const password = document.getElementById("companyPassword").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    updateUIOnSignIn(userCredential.user);
    signInForm.reset();
  } catch (error) {
    alert("Invalid credentials: " + error.message);
  }
});

// ======= Sign Out Handler =======
signOutBtn.addEventListener("click", async () => {
  await signOut(auth);
  resetUIOnSignOut();
});

// ======= Save Company Profile =======
saveProfileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const companyName = companyNameInput.value.trim();
  const bio = companyBioInput.value.trim();
  const website = companyWebsiteInput.value.trim();

  if (!companyName || !bio || !website) {
    alert("Please complete all profile fields.");
    return;
  }

  try {
    await setDoc(doc(db, "companies", user.uid), {
      email: user.email,
      companyName,
      bio,
      website,
      updatedAt: new Date(),
    });
    alert("Company profile saved.");
  } catch (error) {
    alert("Error saving profile: " + error.message);
  }
});

// ======= Load Company Profile on Login =======
async function loadCompanyProfile(uid) {
  const docRef = doc(db, "companies", uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data();
    companyNameInput.value = data.companyName || "";
    companyBioInput.value = data.bio || "";
    companyWebsiteInput.value = data.website || "";
  }
}

// ======= Post Job Handler =======
jobPostForm.addEventListener("submit", async e => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in first.");
    return;
  }

  const title = document.getElementById("jobTitle").value.trim();
  const description = document.getElementById("jobDesc").value.trim();
  const category = document.getElementById("jobCategory").value;
  const skillLevel = document.getElementById("skillLevel").value;
  const location = document.getElementById("location").value.trim();
  const workSetup = document.getElementById("workSetup").value;
  const salary = parseInt(document.getElementById("salary").value.trim());
  const qualificationsRaw = document.getElementById("qualifications").value.trim();

  if (!title || !description || !category || !skillLevel || !location || !workSetup || isNaN(salary) || !qualificationsRaw) {
    alert("Please fill out all fields.");
    return;
  }

  const qualifications = qualificationsRaw.split(",").map(q => q.trim()).filter(Boolean);

  try {
    const companySnap = await getDoc(doc(db, "companies", user.uid));
    const companyInfo = companySnap.exists() ? companySnap.data() : {};

    await addDoc(collection(db, "jobs"), {
      title,
      description,
      category,
      skillLevel,
      location,
      workSetup,
      salary,
      qualifications,
      postedBy: user.email,
      postedAt: new Date(),
      companyName: companyInfo.companyName || "",
      companyWebsite: companyInfo.website || "",
    });

    alert("Job posted successfully!");
    jobPostForm.reset();
  } catch (error) {
    alert("Failed to post job: " + error.message);
  }
});

// ======= Load Jobs Posted by Current Employer =======
function loadEmployerJobs(userEmail) {
  jobListings.innerHTML = `<p>Loading your jobs...</p>`;

  const jobsQuery = query(
    collection(db, "jobs"),
    where("postedBy", "==", userEmail),
    orderBy("postedAt", "desc")
  );

  if (window.jobsUnsubscribe) {
    window.jobsUnsubscribe();
  }

  window.jobsUnsubscribe = onSnapshot(jobsQuery, snapshot => {
    if (snapshot.empty) {
      jobListings.innerHTML = `<p>You have no active job listings.</p>`;
      return;
    }

    jobListings.innerHTML = "";
    snapshot.forEach(docSnap => {
      const job = docSnap.data();
      const jobId = docSnap.id;

      const jobCard = document.createElement("div");
      jobCard.classList.add("job-card");

      const logo = job.logo || "assets/default-company-logo.png";

      jobCard.innerHTML = `
        <div class="job-logo" style="background-image: url('${logo}'); background-size: contain; background-position: center; background-repeat: no-repeat;"></div>
        <div class="job-info">
          <p class="job-title">${job.title}</p>
          <p class="job-company">${job.companyName || job.postedBy}</p>
          <p class="job-location">${job.location}</p>
        </div>
        <button class="delete-btn" data-job-id="${jobId}">Delete</button>
      `;

      jobListings.appendChild(jobCard);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        const jobIdToDelete = btn.getAttribute("data-job-id");
        const confirmDelete = confirm("Are you sure you want to delete this job?");
        if (!confirmDelete) return;

        try {
          await deleteDoc(doc(db, "jobs", jobIdToDelete));
          alert("Job deleted.");
        } catch (error) {
          alert("Failed to delete job: " + error.message);
        }
      };
    });
  });
}

// ======= Listen for Auth State Changes =======
onAuthStateChanged(auth, user => {
  if (user) {
    updateUIOnSignIn(user);
  } else {
    resetUIOnSignOut();
  }
});
