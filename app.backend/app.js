const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');  

require("dotenv").config();

const mongoURI = process.env.MONGODB_URI;
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);  

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Conectare la MongoDB Atlas
mongoose.connect(mongoURI,{
dbName:"GeziDB"
})
  .then(() => console.log('Conectat la MongoDB Atlas!'))
  .catch(err => console.error('Eroare la conectare:', err));
