const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');


require("dotenv").config();

const mongoURI = process.env.MONGODB_URI;
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// Connect to MongoDB Atlas
mongoose.connect(mongoURI)
    .then(() => console.log('Conectat la MongoDB Atlas!'))
    .catch(err => console.error('Eroare la conectare:', err));