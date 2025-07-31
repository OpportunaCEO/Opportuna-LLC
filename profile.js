// profile.js
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

// Suggest recommended skills
skillInput.addEventListener("focus", () => {
  if (!skillInput.value) skillInput.value = recommendedSkills.join(", ");
});

// Resume parsing (pdf.js for PDF)
import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs";

async function extractTextFromPDF(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(i => i.str).join(" ") + " ";
      }
      resolve(fullText);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

resumeInput.addEventListener("change", async () => {
  const file = resumeInput.files[0];
  if (!file) return;
  const text = await extractTextFromPDF(file);
  autofillFields(text);
});

function autofillFields(text) {
  const nameMatch = text.match(/Name[:\s]+([A-Z][a-z]+\s[A-Z][a-z]+)/);
  const experienceMatch = text.match(/Experience[:\s]+([\s\S]{20,500})/i);
  const skillsMatch = text.match(/Skills[:\s]+([\w,\s]+)/i);

  if (nameMatch) document.getElementById("fullName").value = nameMatch[1];
  if (experienceMatch) document.getElementById("experience").value = experienceMatch[1].trim();
  if (skillsMatch) document.getElementById("skills").value = skillsMatch[1].trim();
}

profilePic.addEventListener("change", () => {
  const file = profilePic.files[0];
  if (file) {
    picPreview.src = URL.createObjectURL(file);
    picPreview.style.display = "block";
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "login.html";

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

    const file = profilePic.files[0];
    if (file) {
      const fileRef = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      profileData.profilePicUrl = downloadURL;
    }

    await setDoc(userRef, profileData, { merge: true });

    saveBtn.disabled = false;
    saveBtnText.style.display = "inline";
    saveBtnSpinner.style.display = "none";
    alert("Profile saved successfully!");
  });
});
