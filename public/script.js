// public/script.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile menu toggle ---
  const hamburger = document.querySelector(".hamburger");
  const navLinks  = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // --- Active link based on URL ---
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(link => {
    // Compare href to current page filename
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // --- Contact form ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = contactForm.querySelector('input[name="name"]').value;
      const email   = contactForm.querySelector('input[name="email"]').value;
      const message = contactForm.querySelector('textarea[name="message"]').value;
      const result  = document.getElementById('contactResult');
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({name, email, message})
        });
        const data = await res.json();
        if (res.ok) {
          result.style.color = 'green';
          result.textContent = data.message || 'Message envoyé !';
          contactForm.reset();
        } else {
          result.style.color = 'red';
          result.textContent = data.error || 'Erreur.';
        }
      } catch {
        result.style.color = 'red';
        result.textContent = 'Erreur réseau.';
      }
    });
  }

  // --- Presence form ---
  const presenceForm = document.getElementById('presenceForm');
  if (presenceForm) {
    presenceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('presenceName').value;
      const date = document.getElementById('presenceDate').value;
      const time = document.getElementById('presenceTime').value;
      const result = document.getElementById('presenceResult');
      try {
        const res = await fetch('/api/presences', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({name, date, time})
        });
        const data = await res.json();
        if (res.ok) {
          result.style.color = 'green';
          result.textContent = 'Présence enregistrée !';
          presenceForm.reset();
          loadPresences();
        } else {
          result.style.color = 'red';
          result.textContent = data.error || 'Erreur.';
        }
      } catch {
        result.style.color = 'red';
        result.textContent = 'Erreur réseau.';
      }
    });
  }

  // --- Load presences list ---
  async function loadPresences() {
    const list = document.getElementById('presenceList');
    if (!list) return;
    try {
      const res = await fetch('/api/presences');
      const data = await res.json();
      list.innerHTML = '';
      data.forEach(item => {
        const div = document.createElement('div');
        div.style.padding = '8px';
        div.style.marginBottom = '4px';
        div.style.border = '1px solid #ccc';
        div.style.borderRadius = '4px';
        div.textContent = `${item.name} — le ${item.date} à ${item.time}`;
        list.appendChild(div);
      });
    } catch (err) {
      console.error(err);
    }
  }
  loadPresences();
});
