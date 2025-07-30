// Elements
const signInForm = document.getElementById("signInForm");
const companyEmailInput = document.getElementById("companyEmail");
const signInStatus = document.getElementById("signInStatus");

const jobPostForm = document.getElementById("jobPostForm");
const jobListings = document.getElementById("jobListings");

let signedInEmail = sessionStorage.getItem("signedInEmail") || null;
let postedJobs = JSON.parse(sessionStorage.getItem("postedJobs") || "[]");

// Utility to update UI based on sign-in state
function updateSignInUI() {
  if (signedInEmail) {
    signInStatus.textContent = `Signed in as ${signedInEmail}`;
    signInStatus.style.color = "#a6ff4d";
    companyEmailInput.disabled = true;
    signInForm.querySelector("button").disabled = true;
    jobPostForm.querySelector("button").disabled = false;
  } else {
    signInStatus.textContent = "";
    companyEmailInput.disabled = false;
    signInForm.querySelector("button").disabled = false;
    jobPostForm.querySelector("button").disabled = true;
  }
}

// Render jobs in the active listings section
function renderJobs() {
  jobListings.innerHTML = "";

  if (postedJobs.length === 0) {
    jobListings.innerHTML = "<li>No active listings yet.</li>";
    return;
  }

  postedJobs.forEach((job, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="job-title">${job.title}</span>
      <span class="job-category">${job.category} / ${job.skillLevel}</span>
    `;
    jobListings.appendChild(li);
  });
}

// Handle sign in
signInForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = companyEmailInput.value.trim();

  // Basic email validation (can be enhanced later)
  if (email && email.includes("@")) {
    signedInEmail = email;
    sessionStorage.setItem("signedInEmail", email);
    updateSignInUI();
  } else {
    signInStatus.textContent = "Please enter a valid company email.";
    signInStatus.style.color = "#ff4500";
  }
});

// Handle job post
jobPostForm.addEventListener("submit", e => {
  e.preventDefault();

  if (!signedInEmail) {
    alert("Please sign in with your company email before posting jobs.");
    return;
  }

  const title = document.getElementById("jobTitle").value.trim();
  const desc = document.getElementById("jobDesc").value.trim();
  const category = document.getElementById("jobCategory").value;
  const skillLevel = document.getElementById("skillLevel").value;
  const location = document.getElementById("location").value.trim();
  const workSetup = document.getElementById("workSetup").value;

  if (!title || !desc || !category || !skillLevel || !location || !workSetup) {
    alert("Please fill out all job posting fields.");
    return;
  }

  // Save job posting
  postedJobs.push({
    title,
    desc,
    category,
    skillLevel,
    location,
    workSetup,
    postedBy: signedInEmail,
    postedAt: new Date().toISOString(),
  });

  sessionStorage.setItem("postedJobs", JSON.stringify(postedJobs));

  // Clear form
  jobPostForm.reset();

  // Refresh listings
  renderJobs();

  alert("Job posted successfully!");
});

// Initial setup
updateSignInUI();
renderJobs();
