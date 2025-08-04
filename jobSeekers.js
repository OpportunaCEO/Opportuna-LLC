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

function loadPostedJobs() {
  const storedJobs = JSON.parse(localStorage.getItem("postedJobs") || "[]");
  return storedJobs.map((job, index) => ({
    id: 1000 + index, // ensure unique IDs to avoid collision with default jobs
    title: job.title,
    company: job.postedBy || "Unknown Company",
    location: job.location || "Various",
    jobType: job.category || "",      // you stored this as "category" in employers.js
    workSetup: job.workSetup || "",
    salary: job.salary || 0,
    qualifications: job.qualifications || [],
    logo: "assets/default-company-logo.png",
    description: job.desc || "",
  }));
}

const postedJobs = loadPostedJobs();
const allJobs = [...jobs, ...postedJobs];

// DOM elements
const jobListings = document.getElementById("jobListings");
const searchInput = document.getElementById("searchInput");
const locationInput = document.getElementById("locationInput");
const jobTypeSelect = document.getElementById("jobTypeSelect");
const workSetupSelect = document.getElementById("workSetupSelect");
const salaryRangeSelect = document.getElementById("salaryRangeSelect");
const qualificationInput = document.getElementById("qualificationInput");

// Function to render jobs
function renderJobs(filteredJobs) {
  jobListings.innerHTML = "";

  if (filteredJobs.length === 0) {
    jobListings.innerHTML = "<p>No jobs found matching your criteria.</p>";
    return;
  }

  filteredJobs.forEach(job => {
    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");

    jobCard.innerHTML = `
      <div class="job-logo" style="background-image: url('${job.logo}'); background-size: contain; background-position: center; background-repeat: no-repeat;"></div>
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

// Filter function
function filterJobs() {
  const searchTerm = searchInput.value.toLowerCase();
  const locationTerm = locationInput.value.toLowerCase();
  const jobType = jobTypeSelect.value;
  const workSetup = workSetupSelect.value;
  const salaryRange = salaryRangeSelect.value;
  const qualificationTerm = qualificationInput.value.toLowerCase();

  const filtered = allJobs.filter(job => {
    // Search term match (job title or company)
    const matchesSearch = job.title.toLowerCase().includes(searchTerm) ||
                          job.company.toLowerCase().includes(searchTerm);

    // Location match
    const matchesLocation = locationTerm === "" || job.location.toLowerCase().includes(locationTerm);

    // Job type match
    const matchesJobType = jobType === "" || job.jobType === jobType;

    // Work setup match
    const matchesWorkSetup = workSetup === "" || job.workSetup === workSetup;

    // Salary range match
    let matchesSalary = true;
    if (salaryRange !== "") {
      const [min, max] = salaryRange.split("-").map(s => s.includes("+") ? Number.MAX_SAFE_INTEGER : parseInt(s));
      const salary = job.salary || 0;
      if (salaryRange.includes("+")) {
        matchesSalary = salary >= parseInt(salaryRange);
      } else {
        matchesSalary = salary >= min && salary <= max;
      }
    }

    // Qualifications match (checks if qualification input is contained in any qualification)
    const matchesQualification = qualificationTerm === "" || job.qualifications.some(q => q.toLowerCase().includes(qualificationTerm));

    return matchesSearch && matchesLocation && matchesJobType && matchesWorkSetup && matchesSalary && matchesQualification;
  });

  renderJobs(filtered);
}

// Event listeners for live filtering
searchInput.addEventListener("input", filterJobs);
locationInput.addEventListener("input", filterJobs);
jobTypeSelect.addEventListener("change", filterJobs);
workSetupSelect.addEventListener("change", filterJobs);
salaryRangeSelect.addEventListener("change", filterJobs);
qualificationInput.addEventListener("input", filterJobs);

// Initial render
renderJobs(allJobs);

// ========= DASHBOARD ENHANCEMENTS ========= //

// 1. Set welcome name (you can replace this with Firebase user later)
const userNameEl = document.getElementById("userName");
if (userNameEl) {
  // Placeholder name — you can replace with Firebase user info later
  userNameEl.textContent = "Future Rockstar";
}

// 2. Set profile completion % (simple placeholder logic)
const profileProgressEl = document.getElementById("profileProgress");
const progressFill = document.getElementById("progressFill");
if (profileProgressEl && progressFill) {
  const completionPercent = 60; // You can calculate this based on resume, skills, etc.
  profileProgressEl.textContent = `${completionPercent}%`;
  progressFill.style.width = `${completionPercent}%`;
}

// 3. Show Suggested Jobs (e.g., jobs that are remote or high-paying)
function showSuggestedJobs() {
  const suggestedEl = document.getElementById("suggestedJobs");
  if (!suggestedEl) return;

  const suggestions = allJobs.filter(job =>
    job.workSetup === "remote" || job.salary > 100000
  ).slice(0, 3); // show top 3 only

  if (suggestions.length === 0) {
    suggestedEl.innerHTML = "<p>No suggestions yet.</p>";
    return;
  }

  suggestions.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";
    card.innerHTML = `
      <div class="job-logo" style="background-image: url('${job.logo}'); background-size: contain; background-position: center; background-repeat: no-repeat;"></div>
      <div class="job-info">
        <p class="job-title">${job.title}</p>
        <p class="job-company">${job.company}</p>
        <p class="job-location">${job.location}</p>
      </div>
      <button class="apply-btn">Apply</button>
    `;
    suggestedEl.appendChild(card);
  });
}
showSuggestedJobs();

// 4. Resume & Links Saver (basic localStorage mock or console logging)
window.saveResumeLinks = function () {
  const resume = document.getElementById("resumeUpload")?.files[0];
  const linkedin = document.getElementById("linkedinInput")?.value.trim();
  const portfolio = document.getElementById("portfolioInput")?.value.trim();

  console.log("Saving Resume + Links:");
  if (resume) console.log("Resume File:", resume.name);
  if (linkedin) console.log("LinkedIn URL:", linkedin);
  if (portfolio) console.log("Portfolio URL:", portfolio);

  alert("Your resume and links have been saved (not really, just logged for now)");

  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    const displayName = user.displayName || user.email?.split("@")[0] || "Job Seeker";
    const userNameEl = document.getElementById("userName");
    if (userNameEl) {
      userNameEl.textContent = displayName;
    }
  } else {
    // Not logged in — redirect or just show "Guest"
    const userNameEl = document.getElementById("userName");
    if (userNameEl) {
      userNameEl.textContent = "Guest";
      }
    }
  });
};

