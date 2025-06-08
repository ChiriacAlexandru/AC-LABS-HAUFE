const mongoose = require('mongoose');

const AttractionSchema = new mongoose.Schema({
  googlePlaceId: { type: String, required: true, unique: true },
  name: { type: String },                     // Numele locației
  formattedAddress: { type: String },         // Adresa completă
  location: {                                 // Coordonate
    lat: Number,
    lng: Number
  },
  types: [String],                            // Tipuri de locație (ex: "museum")
  photos: [String],                           // Array cu referințe de poze (photo_reference)
  rating: { type: Number },                   // Rating Google
  userRatingsTotal: { type: Number },         // Număr de recenzii
  website: { type: String },                  // Website oficial
  url: { type: String },                      // Link Google Maps
  phoneNumber: { type: String },              // Număr de telefon internațional
  openingHours: [String],                     // Linii cu orele de deschidere

  category: { type: String },                 // Categoria personalizată
  customTags: [String],                       // Etichete adăugate de user
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // Legătură cu orașul
  recommendedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attraction', AttractionSchema);
