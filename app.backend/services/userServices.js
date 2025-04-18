const user = require('../models/userModels');  

async function getAllUsers() {
  return await user.find();  
}

async function createUser(userData) {
  const newUser = new user(userData); 
  return await newUser.save();  
}

module.exports = { getAllUsers, createUser }; 
