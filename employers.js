// === Existing jobs and loading posted jobs ===
const jobs = [...]; // Keep your original jobs list here

function loadPostedJobs() {
  const storedJobs = JSON.parse(localStorage.getItem("postedJobs") || "[]");
  return storedJobs.map((job, index) => ({
    id: 1000 + index,
    title: job.title,
    company: job.postedBy || "Unknown Company",
    location: job.location || "Various",
    jobType: job.category || "",
    workSetup: job.workSetup || "",
    salary: job.salary || 0,
    qualifications: job.qualifications || [],
    logo: "assets/default-company-logo.png",
    description: job.desc || "",
  }));
}

const postedJobs = loadPostedJobs();
const allJobs = [...jobs, ...postedJobs];

// === Render logic (same as yours) ===
function renderJobs(filteredJobs) {
  const jobListings = document.getElementById("jobListings");
  jobListings.innerHTML = "";
  if (filteredJobs.length === 0) {
    jobListings.innerHTML = "<p>No jobs found matching your criteria.</p>";
    return;
  }
  filteredJobs.forEach(job => {
    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");
    jobCard.innerHTML = `
      <div class="job-logo" style="background-image: url('${job.logo}');"></div>
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

renderJobs(allJobs);

// === Filtering logic (same as yours, using allJobs) ===
function filterJobs() {
  const searchTerm = searchInput.value.toLowerCase();
  const locationTerm = locationInput.value.toLowerCase();
  const jobType = jobTypeSelect.value;
  const workSetup = workSetupSelect.value;
  const salaryRange = salaryRangeSelect.value;
  const qualificationTerm = qualificationInput.value.toLowerCase();

  const filtered = allJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm) ||
                          job.company.toLowerCase().includes(searchTerm);
    const matchesLocation = locationTerm === "" || job.location.toLowerCase().includes(locationTerm);
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

searchInput.addEventListener("input", filterJobs);
locationInput.addEventListener("input", filterJobs);
jobTypeSelect.addEventListener("change", filterJobs);
workSetupSelect.addEventListener("change", filterJobs);
salaryRangeSelect.addEventListener("change", filterJobs);
qualificationInput.addEventListener("input", filterJobs);

// === Sign-up & Sign-in logic ===
let signedInEmail = localStorage.getItem("signedInEmail") || null;
const employerAccounts = JSON.parse(localStorage.getItem("employerAccounts") || "[]");

const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");
const signOutBtn = document.getElementById("signOutBtn");
const signInStatus = document.getElementById("signInStatus");
const jobPostForm = document.getElementById("jobPostForm");

function updateUIOnSignIn(email) {
  signedInEmail = email;
  localStorage.setItem("signedInEmail", email);
  signInStatus.textContent = `Signed in as: ${email}`;
  signOutBtn.style.display = "inline-block";
  signInForm.style.display = "none";
  signUpForm.style.display = "none";
  jobPostForm.style.display = "block";
}

function signOut() {
  signedInEmail = null;
  localStorage.removeItem("signedInEmail");
  signInStatus.textContent = "";
  signOutBtn.style.display = "none";
  signInForm.style.display = "block";
  signUpForm.style.display = "block";
  jobPostForm.style.display = "none";
}

// === Sign Up Event ===
signUpForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signUpEmail").value.trim();
  const password = document.getElementById("signUpPassword").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const alreadyExists = employerAccounts.find(acc => acc.email === email);
  if (alreadyExists) {
    alert("Account already exists. Please sign in instead.");
    return;
  }

  employerAccounts.push({ email, password });
  localStorage.setItem("employerAccounts", JSON.stringify(employerAccounts));
  alert("Account created! You can now sign in.");
  signUpForm.reset();
});

// === Sign In Event ===
signInForm.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("companyEmail").value.trim();
  const password = document.getElementById("companyPassword").value.trim();

  const match = employerAccounts.find(acc => acc.email === email && acc.password === password);
  if (match) {
    updateUIOnSignIn(email);
  } else {
    alert("Invalid credentials. Please try again.");
  }
});

signOutBtn.addEventListener("click", signOut);

// === On page load ===
if (signedInEmail) {
  updateUIOnSignIn(signedInEmail);
} else {
  signOut();
}

// === Job posting logic (same as yours with small fix) ===
jobPostForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!signedInEmail) {
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

  const newJob = {
    title, desc, category, skillLevel, location, workSetup, salary, qualifications,
    postedBy: signedInEmail, postedAt: new Date().toISOString()
  };

  const postedJobs = JSON.parse(localStorage.getItem("postedJobs") || "[]");
  postedJobs.push(newJob);
  localStorage.setItem("postedJobs", JSON.stringify(postedJobs));

  allJobs.push({
    id: 1000 + postedJobs.length,
    title: newJob.title,
    company: newJob.postedBy,
    location: newJob.location,
    jobType: newJob.category,
    workSetup: newJob.workSetup,
    salary: newJob.salary,
    qualifications: newJob.qualifications,
    logo: "assets/default-company-logo.png",
    description: newJob.desc
  });

  renderJobs(allJobs);
  jobPostForm.reset();
  alert("Job posted successfully!");
});
