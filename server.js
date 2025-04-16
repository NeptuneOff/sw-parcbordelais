const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Pour la base de données JSON
const fs = require('fs');
const { join } = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Pour l'envoi d'emails
const nodemailer = require('nodemailer');

// 1) Configuration de lowdb
const adapter = new FileSync(join(__dirname, 'db.json'));
const db = low(adapter);
db.defaults({ presences: [] }).write(); // Définit la structure par défaut si elle n'existe pas

// 2) Configuration d’Express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// 3) Servir les fichiers statiques dans le dossier "public"
app.use(express.static('public'));

// 4) Route pour gérer l’envoi de mail via le formulaire de contact
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    // Configuration de nodemailer avec Gmail
    // IMPORTANT : remplace ci-dessous par un mot de passe d'application Gmail.
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'parc.bordelais.sw@gmail.com',
        pass: 'TON_MOT_DE_PASSE_OU_APP_PASSWORD'
      }
    });

    let mailOptions = {
      from: `"SW Parc Bordelais" <parc.bordelais.sw@gmail.com>`,
      to: 'parc.bordelais.sw@gmail.com', // Même adresse ou une autre de ton choix
      subject: `Nouveau message de ${name}`,
      text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email envoyé avec succès !' });
  } catch (error) {
    console.error('Erreur envoi mail :', error);
    return res.status(500).json({ error: 'Erreur serveur. Impossible d\'envoyer l\'email.' });
  }
});

// 5) Routes pour la gestion des présences
//    POST /api/presences => Ajout d’une présence
app.post('/api/presences', (req, res) => {
  const { name, date, time } = req.body;
  if (!name || !date || !time) {
    return res.status(400).json({ error: 'Champs requis: name, date, time.' });
  }

  const newPresence = {
    id: Date.now(),
    name,
    date,
    time
  };

  db.get('presences').push(newPresence).write();
  return res.status(200).json({ success: true, data: newPresence });
});

//    GET /api/presences => Récupère toutes les présences
app.get('/api/presences', (req, res) => {
  const presences = db.get('presences').value();
  return res.status(200).json(presences);
});

// 6) Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur SW Parc Bordelais démarré sur le port ${PORT}`);
});
