const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ===== Register =====
router.post('/register', async (req, res) => {
  const { name, email, password, preferences } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email deja folosit' });

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      passwordHash,
      preferences: preferences || {}
    });

    await newUser.save();

    res.status(201).json({ message: 'Utilizator creat cu succes' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare server' });
  }
});

// ===== Login =====
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email și parola sunt obligatorii' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Email sau parola greșită' });

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Email sau parola greșită' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, preferences: user.preferences } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare server' });
  }
});

// ===== Get profile =====
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'Utilizatorul nu există' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare server' });
  }
});

// ===== Update profile =====
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, preferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (preferences) updateData.preferences = preferences;

    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updateData, { new: true }).select('-passwordHash');

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare server' });
  }
});

module.exports = router;
