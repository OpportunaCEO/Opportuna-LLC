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

  const filtered = allJobs.filter(job => { ... });
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
renderJobs(alljobs);
