const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");



const userSchema = new mongoose.Schema
({

username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
    minlength: 3,
},
fullname:{
    type: String,
    required: true,
    minlength: 3,
},
email:{
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
},
phone: {
    type: String,
    required: true,
    unique: true,
    match: /^(\+?[1-9]{1}[0-9]{1,14})$/,  
  },
createdAt: {
    type: Date,
    default: Date.now,
},
password: {
    type: String,
    required: true,
    minlength: 6,
},
isAdmin: {
    type: Boolean,
    default: false,
},


});



// Hash the password before saving the user document
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10); // Criptăm parola
    }
    next();
  });

module.exports = mongoose.model("User", userSchema);