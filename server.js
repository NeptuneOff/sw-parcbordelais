// server.js - Version de base pour un environnement hébergé

import express from 'express';        // Si tu utilises ESM, sinon utilise require()
import bodyParser from 'body-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { Low, JSONFile } from 'lowdb';
import { join } from 'path';

// Configuration du port via une variable d'environnement
const PORT = process.env.PORT || 3000;

// Configuration de la base de données avec lowdb (en ESM)
const file = join(process.cwd(), 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);
await db.read();
db.data ||= { presences: [] };

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// Route du formulaire de contact
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    // Configuration de Nodemailer via variables d'environnement
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'parc.bordelais.sw@gmail.com',
        pass: process.env.EMAIL_PASS || 'TON_MOT_DE_PASSE_OU_APP_PASSWORD'
      }
    });

    const mailOptions = {
      from: `"SW Parc Bordelais" <${process.env.EMAIL_USER || 'parc.bordelais.sw@gmail.com'}>`,
      to: process.env.EMAIL_USER || 'parc.bordelais.sw@gmail.com',
      subject: `Nouveau message de ${name}`,
      text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email envoyé avec succès !' });
  } catch (error) {
    console.error('Erreur envoi mail:', error);
    return res.status(500).json({ error: "Erreur serveur. Impossible d'envoyer l'email." });
  }
});

// Route d'ajout d'une présence
app.post('/api/presences', async (req, res) => {
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

  db.data.presences.push(newPresence);
  await db.write();
  return res.status(200).json({ success: true, data: newPresence });
});

// Route de récupération des présences
app.get('/api/presences', (req, res) => {
  return res.status(200).json(db.data.presences);
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
