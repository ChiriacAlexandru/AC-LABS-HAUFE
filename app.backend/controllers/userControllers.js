const userService = require('../services/userServices');

async function getUsers(req, res) {
  const users = await userService.getAllUsers();
  res.json(users);
}

async function addUser(req, res) {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
}

module.exports = { getUsers, addUser };

