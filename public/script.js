// Dark mode + menu + forms + map busyness
document.addEventListener("DOMContentLoaded", () => {
  // --- Dark mode toggle ---
  const toggle = document.querySelector(".theme-toggle");
  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    // save preference
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  });
  // restore
  if (localStorage.getItem("darkMode")==="true") {
    document.body.classList.add("dark-mode");
  }

  // --- Mobile menu toggle ---
  const hamburger = document.querySelector(".hamburger");
  const navLinks  = document.querySelector(".nav-links");
  hamburger?.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // --- Active link highlighting ---
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href")===current);
  });

  // --- Contact form ---
  const contactForm = document.getElementById("contactForm");
  contactForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const name    = contactForm.name.value;
    const email   = contactForm.email.value;
    const message = contactForm.message.value;
    const resDiv  = document.getElementById("contactResult");
    try {
      const res = await fetch("/api/contact", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,email,message})
      });
      const data = await res.json();
      if (res.ok) {
        resDiv.style.color="green";
        resDiv.textContent=data.message||"Message envoyé !";
        contactForm.reset();
      } else {
        resDiv.style.color="red";
        resDiv.textContent=data.error||"Erreur.";
      }
    } catch {
      resDiv.style.color="red";
      resDiv.textContent="Erreur réseau.";
    }
  });

  // --- Presence form ---
  const presenceForm = document.getElementById("presenceForm");
  presenceForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const name = presenceForm.presenceName.value;
    const date = presenceForm.presenceDate.value;
    const time = presenceForm.presenceTime.value;
    const resDiv = document.getElementById("presenceResult");
    try {
      const res = await fetch("/api/presences", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,date,time})
      });
      const data = await res.json();
      if (res.ok) {
        resDiv.style.color="green";
        resDiv.textContent="Présence enregistrée !";
        presenceForm.reset();
        loadPresences();
      } else {
        resDiv.style.color="red";
        resDiv.textContent=data.error||"Erreur.";
      }
    } catch {
      resDiv.style.color="red";
      resDiv.textContent="Erreur réseau.";
    }
  });

  // --- Load presences list ---
  async function loadPresences() {
    const list = document.getElementById("presenceList");
    if (!list) return;
    try {
      const res = await fetch("/api/presences");
      const data = await res.json();
      list.innerHTML = "";
      data.forEach(item => {
        const div = document.createElement("div");
        div.style.padding="8px";
        div.style.marginBottom="4px";
        div.style.border="1px solid #ccc";
        div.style.borderRadius="4px";
        div.textContent = `${item.name} — le ${item.date} à ${item.time}`;
        list.appendChild(div);
      });
    } catch (err) {
      console.error(err);
    }
  }
  loadPresences();
});

// --- Google Maps Places for busyness ---
function initMap() {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;
  const center = { lat: 44.837789, lng: -0.57918 }; // Bordeaux ~ Parc Bordelais
  const map = new google.maps.Map(mapDiv, {
    center,
    zoom: 15,
    disableDefaultUI: true,
    styles: document.body.classList.contains("dark-mode")
      ? [ /* éventuel style sombre pour la carte */ ]
      : []
  });
  const service = new google.maps.places.PlacesService(map);
  service.getDetails({
    placeId: "ChIJBbV3Y6XXVA0RcrvlgxqakAE",
    fields: ["name", "current_popularity"]
  }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const pct = place.current_popularity ?? "N/D";
      document.getElementById("busyness").textContent =
        `Fréquentation actuelle : ${pct}%`;
    }
  });
}
