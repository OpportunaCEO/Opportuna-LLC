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

// DOM elements
const jobListings = document.getElementById("jobListings");
const searchInput = document.getElementById("searchInput");
const locationInput = document.getElementById("locationInput");
const jobTypeSelect = document.getElementById("jobTypeSelect");
const workSetupSelect = document.getElementById("workSetupSelect");
const salaryRangeSelect = document.getElementById("salaryRangeSelect");
const qualificationInput = document.getElementById("qualificationInput");

// --- NEW: Load posted jobs from localStorage and merge with existing jobs ---
function loadPostedJobs() {
  const storedJobs = JSON.parse(localStorage.getItem("postedJobs") || "[]");

  // Map stored jobs to match the structure expected by this script
  return storedJobs.map((job, index) => ({
    id: 1000 + index,  // make sure IDs don't clash
    title: job.title,
    company: job.postedBy || "Unknown Company",
    location: job.location || "Various",
    jobType: "",  // no data for jobType from employer form yet
    workSetup: job.workSetup || "",
    salary: 0, // no salary info stored currently
    qualifications: [], // no qualifications stored currently
    logo: "assets/default-company-logo.png", // default logo placeholder
    description: job.desc || "", // keep description if you want to extend rendering later
  }));
}

// Merge jobs + posted jobs on page load
const postedJobs = loadPostedJobs();
const allJobs = [...jobs, ...postedJobs];

// Function to render jobs (no change)
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

// Filter function updated to use allJobs instead of jobs
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
    const matchesLocation = locationTerm === "" || (job.location && job.location.toLowerCase().includes(locationTerm));

    // Job type match
    const matchesJobType = jobType === "" || job.jobType === jobType;

    // Work setup match
    const matchesWorkSetup = workSetup === "" || job.workSetup === workSetup;

    // Salary range match
    let matchesSalary = true;
    if (salaryRange !== "") {
      if (job.salary) {
        if (salaryRange.includes("+")) {
          matchesSalary = job.salary >= parseInt(salaryRange);
        } else {
          const [min, max] = salaryRange.split("-").map(s => s.includes("+") ? Number.MAX_SAFE_INTEGER : parseInt(s));
          matchesSalary = job.salary >= min && job.salary <= max;
        }
      } else {
        matchesSalary = false; // no salary data means exclude
      }
    }

    // Qualifications match
    const matchesQualification = qualificationTerm === "" || 
      (job.qualifications && job.qualifications.some(q => q.toLowerCase().includes(qualificationTerm)));

    return matchesSearch && matchesLocation && matchesJobType && matchesWorkSetup && matchesSalary && matchesQualification;
  });

  renderJobs(filtered);
}

// Event listeners for live filtering (no change)
searchInput.addEventListener("input", filterJobs);
locationInput.addEventListener("input", filterJobs);
jobTypeSelect.addEventListener("change", filterJobs);
workSetupSelect.addEventListener("change", filterJobs);
salaryRangeSelect.addEventListener("change", filterJobs);
qualificationInput.addEventListener("input", filterJobs);

// Initial render uses merged allJobs
renderJobs(allJobs);
