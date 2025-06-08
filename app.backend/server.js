require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

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
const routeRoutes = require('./routes/route');
app.use('/api/routes', routeRoutes);
const attractionRoutes = require('./routes/attraction');
app.use('/api/attractions', attractionRoutes);


// Pornire server
app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe http://localhost:${PORT}`);
});

// Ruta de test pentru GET /
app.get('/', (req, res) => {
  res.send('Serverul funcționează!');
});
