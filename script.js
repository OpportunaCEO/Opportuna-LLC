window.addEventListener('DOMContentLoaded', () => {
  const authPopup = document.getElementById('authPopup');

  // Show popup on page load
  authPopup.style.display = 'flex';

  // Optional: toggle to signup (if you expand later)
  const toggleSignup = document.getElementById('toggleSignup');
  if (toggleSignup) {
    toggleSignup.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Redirecting to signup (or show signup form here)');
    });
  }

  // Example login submit handler
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    console.log("Login attempted with", email, password);

    // Replace this with Firebase Auth logic later
    alert('Login successful (placeholder)');
    authPopup.style.display = 'none';
  });
});
