// server.js

// Importer Express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Créer l'instance de l'application Express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// Exemple de route
app.get('/', (req, res) => {
  res.send('Hello from SW Parc Bordelais!');
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
