const express = require('express');
const router = express.Router();
const User = require('../models/userModels'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  try {
    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secretul_tau_super_secret',
      { expiresIn: '1h' }
    );

    console.log('Login successful for user:', user.email);
    res.json({ token, userId: user._id }); // Include user ID in response
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
