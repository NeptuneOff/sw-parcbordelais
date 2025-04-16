// --- Contact form handling ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Récupération des champs
    const name = contactForm.querySelector('input[name="name"]').value;
    const email = contactForm.querySelector('input[name="email"]').value;
    const message = contactForm.querySelector('textarea[name="message"]').value;

    const resultDiv = document.getElementById('contactResult');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();
      if (response.ok) {
        resultDiv.style.color = 'green';
        resultDiv.textContent = data.message || 'Votre message a bien été envoyé !';
        contactForm.reset();
      } else {
        resultDiv.style.color = 'red';
        resultDiv.textContent = data.error || 'Une erreur est survenue.';
      }
    } catch (err) {
      console.error(err);
      resultDiv.style.color = 'red';
      resultDiv.textContent = 'Erreur réseau ou serveur.';
    }
  });
}

// --- Presence form handling ---
const presenceForm = document.getElementById('presenceForm');
if (presenceForm) {
  presenceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('presenceName').value;
    const date = document.getElementById('presenceDate').value;
    const time = document.getElementById('presenceTime').value;
    const presenceResult = document.getElementById('presenceResult');

    try {
      const response = await fetch('/api/presences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, date, time })
      });
      const data = await response.json();

      if (response.ok) {
        presenceResult.style.color = 'green';
        presenceResult.textContent = 'Ta présence a été enregistrée !';
        presenceForm.reset();
        // Rafraîchit la liste
        loadPresences();
      } else {
        presenceResult.style.color = 'red';
        presenceResult.textContent = data.error || 'Erreur lors de l’enregistrement.';
      }
    } catch (err) {
      console.error(err);
      presenceResult.style.color = 'red';
      presenceResult.textContent = 'Erreur serveur.';
    }
  });
}

// --- Load presences list ---
async function loadPresences() {
  const presenceListDiv = document.getElementById('presenceList');
  if (!presenceListDiv) return; // pas sur la page community

  try {
    const response = await fetch('/api/presences');
    const data = await response.json(); // tableau d'objets
    if (Array.isArray(data)) {
      presenceListDiv.innerHTML = '';
      data.forEach(item => {
        const el = document.createElement('div');
        el.style.padding = '8px';
        el.style.marginBottom = '4px';
        el.style.border = '1px solid #ccc';
        el.style.borderRadius = '4px';

        el.textContent = `${item.name} — le ${item.date} à ${item.time}`;
        presenceListDiv.appendChild(el);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// Au chargement de la page, on tente de charger les présences si le bloc presenceList est présent.
document.addEventListener('DOMContentLoaded', () => {
  loadPresences();
});
