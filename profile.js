import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

const profileForm = document.getElementById("profileForm");
const picPreview = document.getElementById("picPreview");
const profilePic = document.getElementById("profilePic");
const resumeInput = document.getElementById("resumeUpload");
const skillInput = document.getElementById("skills");
const languageSelect = document.getElementById("languages");
const disabilityStatus = document.getElementById("disabilityStatus");
const saveBtn = document.getElementById("saveProfileBtn");
const saveBtnText = document.getElementById("saveBtnText");
const saveBtnSpinner = document.getElementById("saveBtnSpinner");

const recommendedSkills = ["JavaScript", "React", "Firebase", "Python", "Project Management", "Communication", "SQL", "Design", "Leadership"];

// Suggest recommended skills on focus
skillInput.addEventListener("focus", () => {
  if (!skillInput.value) skillInput.value = recommendedSkills.join(", ");
});

// PDF.js setup
import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs";

async function extractTextFromPDF(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + " ";
      }
      resolve(fullText);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// More robust autofill logic
function autofillFields(text) {
  console.log("Extracted resume text:", text);

  // Attempt to find a full name (simple heuristic: 2 capitalized words near the start)
  const nameMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
  if (nameMatch) {
    document.getElementById("fullName").value = nameMatch[1];
  }

  // Look for skills: find recommended skills present in the text
  const foundSkills = recommendedSkills.filter(skill =>
    new RegExp(`\\b${skill}\\b`, "i").test(text)
  );
  if (foundSkills.length > 0) {
    skillInput.value = foundSkills.join(", ");
  }

  // Try to extract a chunk of work experience text after keywords
  const expMatch = text.match(/(Experience|Work Experience|Professional Experience)[\s:\-]*([\s\S]{50,500})/i);
  if (expMatch) {
    document.getElementById("experience").value = expMatch[2].trim();
  }

  // No autofill for languages or disability — user fills manually
  console.log("Autofill complete.");
}

resumeInput.addEventListener("change", async () => {
  const file = resumeInput.files[0];
  if (!file) return;
  try {
    const text = await extractTextFromPDF(file);
    autofillFields(text);
  } catch (err) {
    console.error("Error parsing PDF resume:", err);
    alert("Sorry, failed to parse the resume. Please fill in details manually.");
  }
});

profilePic.addEventListener("change", () => {
  const file = profilePic.files[0];
  if (file) {
    picPreview.src = URL.createObjectURL(file);
    picPreview.style.display = "block";
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "login.html";

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById("fullName").value = data.fullName || "";
      document.getElementById("bio").value = data.bio || "";
      document.getElementById("skills").value = data.skills || "";
      document.getElementById("experience").value = data.experience || "";
      languageSelect.value = data.languages || "";
      disabilityStatus.value = data.disability || "";
      if (data.profilePicUrl) {
        picPreview.src = data.profilePicUrl;
        picPreview.style.display = "block";
      }
    }
  } catch (err) {
    console.error("Error loading profile:", err);
  }

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtnText.style.display = "none";
    saveBtnSpinner.style.display = "inline";

    const profileData = {
      fullName: document.getElementById("fullName").value,
      bio: document.getElementById("bio").value,
      skills: document.getElementById("skills").value,
      experience: document.getElementById("experience").value,
      languages: languageSelect.value,
      disability: disabilityStatus.value
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
