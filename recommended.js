const jobs = [
  "Frontend Developer at Innovatech",
  "UX Designer at CreativeCore",
  "Data Analyst at FinSight",
  "Marketing Manager at BrandHero",
  "Cloud Engineer at SkyNetics"
];

const jobList = document.getElementById("recommendedJobs");
jobs.forEach(job => {
  const card = document.createElement("div");
  card.className = "job-card";
  card.textContent = job;
  jobList.appendChild(card);
});
