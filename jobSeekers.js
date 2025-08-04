// Firebase imports
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app } from "./script.js";
const auth = getAuth(app);
const db = getFirestore(app);

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
];

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

const jobListings = document.getElementById("jobListings");
const searchInput = document.getElementById("searchInput");
const locationInput = document.getElementById("locationInput");
const jobTypeSelect = document.getElementById("jobTypeSelect");
const workSetupSelect = document.getElementById("workSetupSelect");
const salaryRangeSelect = document.getElementById("salaryRangeSelect");
const qualificationInput = document.getElementById("qualificationInput");

let userAppliedJobs = [];

async function fetchUserApplications(userId) {
  const q = query(collection(db, "applications"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  userAppliedJobs = snapshot.docs.map(doc => doc.data().jobId);
  renderJobs(allJobs);
}

async function applyToJob(jobId) {
  const user = auth.currentUser;
  if (!user) return alert("Please log in to apply.");

  if (userAppliedJobs.includes(jobId)) return;

  try {
    await addDoc(collection(db, "applications"), {
      userId: user.uid,
      jobId,
      appliedAt: new Date().toISOString()
    });
    userAppliedJobs.push(jobId);
    renderJobs(allJobs);
  } catch (error) {
    console.error("Error applying to job:", error);
  }
}

function renderJobs(filteredJobs) {
  jobListings.innerHTML = "";

  if (filteredJobs.length === 0) {
    jobListings.innerHTML = "<p>No jobs found matching your criteria.</p>";
    return;
  }

  filteredJobs.forEach(job => {
    const applied = userAppliedJobs.includes(job.id);

    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");

    jobCard.innerHTML = `
      <div class="job-logo" style="background-image: url('${job.logo}');"></div>
      <div class="job-info">
        <p class="job-title">${job.title}</p>
        <p class="job-company">${job.company}</p>
        <p class="job-location">${job.location}</p>
      </div>
      <button class="apply-btn" data-job-id="${job.id}" ${applied ? "disabled" : ""}>
        ${applied ? "Applied" : "Apply"}
      </button>
    `;

    jobListings.appendChild(jobCard);
  });

  document.querySelectorAll(".apply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const jobId = parseInt(btn.getAttribute("data-job-id"));
      applyToJob(jobId);
    });
  });
}

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
      const [min, max] = salaryRange.split("-").map(s => s.includes("+") ? Number.MAX_SAFE_INTEGER : parseInt(s));
      const salary = job.salary || 0;
      if (salaryRange.includes("+")) {
        matchesSalary = salary >= parseInt(salaryRange);
      } else {
        matchesSalary = salary >= min && salary <= max;
      }
    }

    const matchesQualification = qualificationTerm === "" || job.qualifications.some(q => q.toLowerCase().includes(qualificationTerm));

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

onAuthStateChanged(auth, user => {
  if (user) {
    fetchUserApplications(user.uid);
  } else {
    renderJobs(allJobs);
  }
});
