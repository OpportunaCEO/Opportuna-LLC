import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// PDF.js setup
import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  const profileForm = document.getElementById("profileForm");
  const picPreview = document.getElementById("picPreview");
  const profilePic = document.getElementById("profilePic");
  const resumeInput = document.getElementById("resumeUpload");
  const skillInputField = document.getElementById("skillInput");
  const languageSelect = document.getElementById("languages");
  const disabilityStatus = document.getElementById("disabilityStatus");
  const saveBtn = document.getElementById("saveProfileBtn");
  const saveBtnText = document.getElementById("saveBtnText");
  const saveBtnSpinner = document.getElementById("saveBtnSpinner");
  const resumeStatus = document.getElementById("resumeStatus");

  // Recommended skills list
  const recommendedSkills = [
    "JavaScript",
    "React",
    "Firebase",
    "Python",
    "Project Management",
    "Communication",
    "SQL",
    "Design",
    "Leadership",
  ];

  // Show recommended skills under skill input
  const recommendedSkillsSpan = document.getElementById("recommendedSkills");
  recommendedSkillsSpan.textContent = recommendedSkills.join(", ");

  // PDF resume text extraction function
  async function extractTextFromPDF(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item) => item.str).join(" ") + " ";
          }
          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Autofill profile fields from extracted resume text
  function autofillFields(text) {
    console.log("Extracted resume text:", text);

    const nameMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (nameMatch) {
      document.getElementById("fullName").value = nameMatch[1];
    }

    const foundSkills = recommendedSkills.filter((skill) =>
      new RegExp(`\\b${skill}\\b`, "i").test(text)
    );
    if (foundSkills.length > 0) {
      parseSkillsToChips(foundSkills.join(", "));
    }

    const expMatch = text.match(
      /(Experience|Work Experience|Professional Experience)[\s:\-]*([\s\S]{50,500})/i
    );
    if (expMatch) {
      document.getElementById("experience").value = expMatch[2].trim();
    }

    resumeStatus.textContent = "✅ Resume parsed successfully!";
  }

  resumeInput.addEventListener("change", async () => {
    const file = resumeInput.files[0];
    if (!file) return;
    resumeStatus.textContent = "Parsing resume...";
    try {
      const text = await extractTextFromPDF(file);
      autofillFields(text);
    } catch (err) {
      console.error("Error parsing PDF resume:", err);
      alert("Sorry, failed to parse the resume. Please fill in details manually.");
      resumeStatus.textContent = "⚠️ Failed to parse resume.";
    }
  });

  profilePic.addEventListener("change", () => {
    const file = profilePic.files[0];
    if (file) {
      picPreview.src = URL.createObjectURL(file);
      picPreview.style.display = "block";
      updatePreview();
    }
  });

  // --- Profile preview and skill chips logic ---

  const progressFill = document.getElementById("progressFill");
  const previewName = document.getElementById("previewName");
  const previewBio = document.getElementById("previewBio");
  const previewSkills = document.getElementById("previewSkills");
  const previewLanguages = document.getElementById("previewLanguages");
  const previewDisability = document.getElementById("previewDisability");
  const previewExperience = document.getElementById("previewExperience");
  const previewProfilePic = document.getElementById("previewProfilePic");

  const skillChipsContainer = document.getElementById("skillChips");

  // Update live preview panel
  function updatePreview() {
    previewName.textContent = document.getElementById("fullName").value || "Your Name";
    previewBio.textContent = document.getElementById("bio").value || "Your bio will appear here.";
    previewExperience.textContent = document.getElementById("experience").value || "Your experience summary will appear here.";

    // Skills display
    const skillList = [...skillChipsContainer.querySelectorAll(".skill-chip")].map(
      (chip) => chip.textContent
    );
    previewSkills.textContent = skillList.length > 0 ? skillList.join(", ") : "None";

    // Languages display (multiple select)
    const langSelect = document.getElementById("languages");
    const selectedLangs = [...langSelect.selectedOptions].map(opt => opt.value);
    previewLanguages.textContent = selectedLangs.length > 0 ? selectedLangs.join(", ") : "None";

    // Disability
    const disabilityVal = document.getElementById("disabilityStatus").value;
    previewDisability.textContent = disabilityVal || "Not specified";

    // Profile pic
    const picSrc = document.getElementById("picPreview").src;
    previewProfilePic.src = picSrc && picSrc !== window.location.href ? picSrc : "assets/default.png";

    updateProgressBar();
  }

  // Update progress bar based on fields filled
  function updateProgressBar() {
    const fields = [
      "fullName",
      "bio",
      "experience",
      "disabilityStatus",
    ];
    let filled = fields.reduce((acc, id) => acc + (!!document.getElementById(id).value ? 1 : 0), 0);

    // count skills separately
    const skillCount = skillChipsContainer.querySelectorAll(".skill-chip").length;
    if (skillCount > 0) filled++;

    // languages multiple select
    const langCount = document.getElementById("languages").selectedOptions.length;
    if (langCount > 0) filled++;

    const total = fields.length + 2; // skills + languages
    const percent = (filled / total) * 100;
    progressFill.style.width = percent + "%";
  }

  // Add skill chip element
  function addSkillChip(skill) {
    skill = skill.trim();
    if (!skill) return;

    // Prevent duplicates
    const existing = [...skillChipsContainer.querySelectorAll(".skill-chip")].some(
      (chip) => chip.textContent.toLowerCase() === skill.toLowerCase()
    );
    if (existing) return;

    const chip = document.createElement("span");
    chip.className = "skill-chip";
    chip.textContent = skill;
    chip.title = "Click to remove";
    chip.addEventListener("click", () => {
      chip.remove();
      updatePreview();
    });
    skillChipsContainer.appendChild(chip);
    updatePreview();
  }

  // Convert skills CSV string to chips
  function parseSkillsToChips(skillsString) {
    skillChipsContainer.innerHTML = "";
    skillsString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .forEach(addSkillChip);
  }

  // Handle Enter key on skill input
  skillInputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkillChip(skillInputField.value);
      skillInputField.value = "";
    }
  });

  // Update preview when form fields change
  ["fullName", "bio", "experience", "languages", "disabilityStatus"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updatePreview);
  });

  skillInputField.addEventListener("input", updatePreview);
  profilePic.addEventListener("change", updatePreview);
  skillChipsContainer.addEventListener("click", updatePreview);

  // --- Edit Profile Toggle Button Logic ---
const formFields = [
  document.getElementById('fullName'),
  document.getElementById('bio'),
  document.getElementById('skillInput'),
  document.getElementById('languages'),
  document.getElementById('disabilityStatus'),
  document.getElementById('experience'),
  document.getElementById('profilePic'),
  document.getElementById('resumeUpload'),
  document.getElementById('saveProfileBtn')
];

let isEditing = true; // Starts in editing mode

document.getElementById('editToggleBtn')?.addEventListener('click', () => {
  isEditing = !isEditing;

  formFields.forEach(field => {
    if (field) field.disabled = !isEditing;
  });

  document.getElementById('editToggleBtn').textContent = isEditing
    ? 'Save Changes'
    : 'Edit Profile';
});


  // Auth state and load profile data
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (window.location.href = "login.html");

    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        document.getElementById("fullName").value = data.fullName || "";
        document.getElementById("bio").value = data.bio || "";
        document.getElementById("experience").value = data.experience || "";
        disabilityStatus.value = data.disability || "";
        languageSelect.value = data.languages || "";

        if (data.skills) parseSkillsToChips(data.skills);

        if (data.profilePicUrl) {
          picPreview.src = data.profilePicUrl;
          picPreview.style.display = "block";
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }

    updatePreview();

    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      saveBtn.disabled = true;
      saveBtnText.style.display = "none";
      saveBtnSpinner.style.display = "inline";

      const skillList = [...skillChipsContainer.querySelectorAll(".skill-chip")].map(
        (chip) => chip.textContent
      );
      const profileData = {
        fullName: document.getElementById("fullName").value,
        bio: document.getElementById("bio").value,
        skills: skillList.join(", "),
        experience: document.getElementById("experience").value,
        languages: languageSelect.value,
        disability: disabilityStatus.value,
      };

      try {
        const file = profilePic.files[0];
        if (file) {
          const fileRef = ref(storage, `profilePics/${user.uid}`);
          await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(fileRef);
          profileData.profilePicUrl = downloadURL;
        }

        await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
        alert("Profile saved successfully!");
      } catch (err) {
        console.error("Error saving profile:", err);
        alert("Failed to save profile. Please try again.");
      } finally {
        saveBtn.disabled = false;
        saveBtnText.style.display = "inline";
        saveBtnSpinner.style.display = "none";
      }
    });
  });
});
