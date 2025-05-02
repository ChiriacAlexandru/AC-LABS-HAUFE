const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  regiune: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  judet: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  denumire: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  localitate: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  latitudine: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitudine: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  descriereScurta: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Location", locationSchema);