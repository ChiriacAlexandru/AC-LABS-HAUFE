const AttractionSchema = new mongoose.Schema({
  googlePlaceId: { type: String, required: true, unique: true },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  category: { type: String },
  customTags: [String],
  recommendedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attraction', AttractionSchema);
