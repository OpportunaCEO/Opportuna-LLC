import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();

const upgradeButtons = document.querySelectorAll("button.upgrade-btn");
const upgradeStatus = document.getElementById("upgradeStatus");
const userDropdown = document.getElementById("userDropdown");
const loginLink = document.getElementById("loginLink");

// Disable upgrade buttons if not logged in; show login prompt instead
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

upgradeButtons.forEach(button => {
  button.addEventListener("click", () => {
    const plan = button.dataset.plan;
    if (!auth.currentUser) {
      alert("Please log in to upgrade.");
      return;
    }
    // Placeholder: Here you would call your payment integration or backend upgrade logic.
    upgradeStatus.textContent = `You have selected the "${plan}" plan. Upgrade feature coming soon!`;
    button.textContent = "Selected";
    upgradeButtons.forEach(btn => {
      if (btn !== button) btn.textContent = "Upgrade";
    });
  });
});
