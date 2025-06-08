const ComplaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  googlePlaceId: { type: String, required: true },
  type: { type: String, enum: ['închis', 'greșit', 'nepotrivit', 'altceva'] },
  message: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
