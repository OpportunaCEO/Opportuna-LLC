// ======= Firebase SDK imports =======
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, query, orderBy, onSnapshot 
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

// ======= Existing jobs array - keep your original jobs here =======
const jobs = [
  {
    id: 1,
    title: "Software Engineer",
    company: "TechCorp",
    location: "New York, NY",
    jobType: "fulltime",
    workSetup: "hybrid",
    salary: 120000,
    qualifications: ["Bachelor's Degree", "3+ years experience"],
    logo: "assets/techcorp-logo.png",
  },
  {
    id: 2,
    title: "Marketing Specialist",
    company: "BrightMedia",
    location: "Remote",
    jobType: "parttime",
    workSetup: "remote",
    salary: 60000,
    qualifications: ["Bachelor's Degree", "Marketing experience"],
    logo: "assets/brightmedia-logo.png",
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "FinSolve",
    location: "San Francisco, CA",
    jobType: "fulltime",
    workSetup: "inperson",
    salary: 90000,
    qualifications: ["Bachelor's Degree", "SQL, Excel"],
    logo: "assets/finsolve-logo.png",
  },
  // Add more jobs as needed
];

// ======= DOM references for filter inputs and listings =======
const jobListings = document.getElementById("jobListings");
const searchInput = document.getElementById("searchInput");
const locationInput = document.getElementById("locationInput");
const jobTypeSelect = document.getElementById("jobTypeSelect");
const workSetupSelect = document.getElementById("workSetupSelect");
const salaryRangeSelect = document.getElementById("salaryRangeSelect");
const qualificationInput = document.getElementById("qualificationInput");

// ======= Forms and buttons =======
const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");
const signOutBtn = document.getElementById("signOutBtn");
const signInStatus = document.getElementById("signInStatus");
const jobPostForm = document.getElementById("jobPostForm");

// ======= UI helper functions =======
function updateUIOnSignIn(user) {
  signInStatus.textContent = `Signed in as: ${user.email}`;
  signOutBtn.style.display = "inline-block";
  signInForm.style.display = "none";
  signUpForm.style.display = "none";
  jobPostForm.style.display = "block";
  // Load jobs real-time when signed in
  loadJobsRealtime();
}

function resetUIOnSignOut() {
  signInStatus.textContent = "";
  signOutBtn.style.display = "none";
  signInForm.style.display = "block";
  signUpForm.style.display = "none";
  jobPostForm.style.display = "none";
  renderJobs(jobs); // Show original jobs only when signed out
}

// ======= Toggle between sign-up and sign-in forms =======
document.getElementById("showSignUp").addEventListener("click", e => {
  e.preventDefault();
  signInForm.style.display = "none";
  signUpForm.style.display = "block";
});
document.getElementById("showSignIn").addEventListener("click", e => {
  e.preventDefault();
  signUpForm.style.display = "none";
  signInForm.style.display = "block";
});

// ======= Sign Up handler =======
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

// ======= Sign In handler =======
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

// ======= Sign Out handler =======
signOutBtn.addEventListener("click", async () => {
  await signOut(auth);
  resetUIOnSignOut();
});

// ======= Auth state listener (persists login on refresh) =======
onAuthStateChanged(auth, (user) => {
  if (user) {
    updateUIOnSignIn(user);
  } else {
    resetUIOnSignOut();
  }
});

// ======= Job posting handler =======
jobPostForm.addEventListener("submit", async e => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in first.");
    return;
  }

  const title = document.getElementById("jobTitle").value.trim();
  const desc = document.getElementById("jobDesc").value.trim();
  const category = document.getElementById("jobCategory").value;
  const skillLevel = document.getElementById("skillLevel").value;
  const location = document.getElementById("location").value.trim();
  const workSetup = document.getElementById("workSetup").value;
  const salary = parseInt(document.getElementById("salary").value.trim());
  const qualificationsRaw = document.getElementById("qualifications").value.trim();

  if (!title || !desc || !category || !skillLevel || !location || !workSetup || isNaN(salary) || !qualificationsRaw) {
    alert("Please fill out all fields.");
    return;
  }

  const qualifications = qualificationsRaw.split(",").map(q => q.trim()).filter(Boolean);

  try {
    await addDoc(collection(db, "jobs"), {
      title,
      description: desc,
      category,
      skillLevel,
      location,
      workSetup,
      salary,
      qualifications,
      postedBy: user.email,
      postedAt: new Date(),
    });
    alert("Job posted successfully!");
    jobPostForm.reset();
  } catch (error) {
    alert("Failed to post job: " + error.message);
  }
});

// ======= Real-time job loading and rendering =======
function renderJobs(jobsToRender) {
  jobListings.innerHTML = "";
  if (!jobsToRender || jobsToRender.length === 0) {
    jobListings.innerHTML = "<p>No jobs found matching your criteria.</p>";
    return;
  }
  jobsToRender.forEach(job => {
    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");
    jobCard.innerHTML = `
      <div class="job-logo" style="background-image: url('${job.logo || "assets/default-company-logo.png"}'); background-size: contain; background-position: center; background-repeat: no-repeat;"></div>
      <div class="job-info">
        <p class="job-title">${job.title}</p>
        <p class="job-company">${job.company}</p>
        <p class="job-location">${job.location}</p>
      </div>
      <button class="apply-btn">Apply</button>
    `;
    jobListings.appendChild(jobCard);
  });
}

// Filtering UI elements (if you have them in your page)
if (searchInput) searchInput.addEventListener("input", filterJobs);
if (locationInput) locationInput.addEventListener("input", filterJobs);
if (jobTypeSelect) jobTypeSelect.addEventListener("change", filterJobs);
if (workSetupSelect) workSetupSelect.addEventListener("change", filterJobs);
if (salaryRangeSelect) salaryRangeSelect.addEventListener("change", filterJobs);
if (qualificationInput) qualificationInput.addEventListener("input", filterJobs);

// ======= Filter jobs function (client-side filtering) =======
let currentJobs = []; // will hold jobs from Firestore + local jobs

function filterJobs() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const locationTerm = locationInput ? locationInput.value.toLowerCase() : "";
  const jobType = jobTypeSelect ? jobTypeSelect.value : "";
  const workSetup = workSetupSelect ? workSetupSelect.value : "";
  const salaryRange = salaryRangeSelect ? salaryRangeSelect.value : "";
  const qualificationTerm = qualificationInput ? qualificationInput.value.toLowerCase() : "";

  const filtered = currentJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm) ||
                          job.company.toLowerCase().includes(searchTerm);
    const matchesLocation = locationTerm === "" || (job.location && job.location.toLowerCase().includes(locationTerm));
    const matchesJobType = jobType === "" || job.jobType === jobType;
    const matchesWorkSetup = workSetup === "" || job.workSetup === workSetup;

    let matchesSalary = true;
    if (salaryRange !== "") {
      if (job.salary) {
        if (salaryRange.includes("+")) {
          matchesSalary = job.salary >= parseInt(salaryRange);
        } else {
          const [min, max] = salaryRange.split("-").map(s => parseInt(s));
          matchesSalary = job.salary >= min && job.salary <= max;
        }
      } else {
        matchesSalary = false;
      }
    }

    const matchesQualification = qualificationTerm === "" ||
      (job.qualifications && job.qualifications.some(q => q.toLowerCase().includes(qualificationTerm)));

    return matchesSearch && matchesLocation && matchesJobType && matchesWorkSetup && matchesSalary && matchesQualification;
  });

  renderJobs(filtered);
}

// ======= Real-time Firestore listener to load all jobs =======
function loadJobsRealtime() {
  const jobsQuery = query(collection(db, "jobs"), orderBy("postedAt", "desc"));
  onSnapshot(jobsQuery, (snapshot) => {
    const jobsFromFirestore = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      jobsFromFirestore.push({
        id: doc.id,
        title: data.title,
        company: data.postedBy,
        location: data.location,
        jobType: data.category,
        workSetup: data.workSetup,
        salary: data.salary,
        qualifications: data.qualifications,
        logo: "assets/default-company-logo.png",
        description: data.description || "",
      });
    });
    currentJobs = [...jobs, ...jobsFromFirestore]; // combine initial jobs with Firestore jobs
    filterJobs();
  });
}

// ======= Initial render with local jobs only =======
renderJobs(jobs);

// ======= If user is already signed in when page loads =======
onAuthStateChanged(auth, user => {
  if (user) {
    updateUIOnSignIn(user);
  } else {
    resetUIOnSignOut();
  }
});
