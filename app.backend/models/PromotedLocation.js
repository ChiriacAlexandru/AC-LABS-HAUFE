const mongoose = require('mongoose');

const PromotedLocationSchema = new mongoose.Schema({
  googlePlaceId: { type: String, required: true },
  promotedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // adminul
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('PromotedLocation', PromotedLocationSchema);
