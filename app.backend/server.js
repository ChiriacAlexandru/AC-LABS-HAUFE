require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware pentru JSON
app.use(express.json());

// Citim variabilele din .env
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Conectare la MongoDB
mongoose.connect(MONGO_URI)
.then(() => console.log('Conectat la MongoDB'))
.catch(err => console.error('Eroare la conectarea MongoDB:', err));


// Importăm rutele
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);




// Pornire server
app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe http://localhost:${PORT}`);
});

// Ruta de test pentru GET /
app.get('/', (req, res) => {
  res.send('Serverul funcționează!');
});
