const form = document.getElementById("contactForm");
const confirm = document.getElementById("confirmation");

form.addEventListener("submit", e => {
  e.preventDefault();
  confirm.classList.remove("hidden");
  form.reset();
});
