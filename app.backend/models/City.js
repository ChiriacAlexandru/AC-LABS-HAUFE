const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model('City', CitySchema);
