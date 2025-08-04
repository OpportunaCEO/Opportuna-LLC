import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

const upgradeButtons = document.querySelectorAll("button.upgrade-btn");
const upgradeStatus = document.getElementById("upgradeStatus");
const userDropdown = document.getElementById("userDropdown");
const loginLink = document.getElementById("loginLink");

function setButtonStates(isLoggedIn) {
  upgradeButtons.forEach(btn => btn.disabled = !isLoggedIn);
  if (!isLoggedIn) {
    upgradeStatus.textContent = "Please log in to upgrade your membership.";
  } else {
    upgradeStatus.textContent = "";
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    setButtonStates(true);
    loginLink.style.display = "none";
    userDropdown.style.display = "inline-block";
  } else {
    setButtonStates(false);
    loginLink.style.display = "inline-block";
    userDropdown.style.display = "none";
  }
});

async function upgradePlan(plan) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to upgrade.");
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      premiumPlan: plan,
      premiumSince: serverTimestamp()
    }, { merge: true });

    upgradeStatus.textContent = `Success! You have upgraded to the "${plan}" plan.`;
    upgradeButtons.forEach(btn => {
      btn.textContent = btn.dataset.plan === plan ? "Selected" : "Upgrade";
    });
  } catch (err) {
    console.error("Upgrade failed:", err);
    upgradeStatus.textContent = "Upgrade failed. Please try again later.";
  }
}

upgradeButtons.forEach(button => {
  button.addEventListener("click", () => {
    const plan = button.dataset.plan;
    upgradePlan(plan);
  });
});
