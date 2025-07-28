// Handle navigation between sections
document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('[data-section]');
  const sections = document.querySelectorAll('.section');

  // Navigation logic
  function navigateTo(sectionId) {
    sections.forEach(section => section.classList.add('hidden'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Set up button listeners using data-section attributes
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-section');
      navigateTo(target);
    });
  });

  // Simple contact form feedback
  const contactForm = document.querySelector('form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your message has been sent.');
      contactForm.reset();
    });
  }

  // Basic job search functionality (placeholder)
  const searchInput = document.getElementById('jobSearch');
  const searchButton = document.getElementById('searchBtn');

  if (searchInput && searchButton) {
    searchButton.addEventListener('click', () => {
      const term = searchInput.value.trim().toLowerCase();
      const jobs = document.querySelectorAll('.job-card');
      if (!term) return;

      jobs.forEach(job => {
        job.style.display = job.textContent.toLowerCase().includes(term) ? 'block' : 'none';
      });
    });
  }
});
