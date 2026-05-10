const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  console.log('=== LOGIN START ===');
  const { email, password } = req.body;
  console.log('Email:', email);
  console.log('Password provided:', !!password);

  try {
    console.log('Looking up user...');
    const user = await User.findOne({ email });
    console.log('User found?', !!user);
    if (user) {
      console.log('User role:', user.role);
      console.log('Password hash exists?', !!user.password_hash);
    }

    if (!user || user.role !== 'admin') {
      console.log('Auth failed: user missing or not admin');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Signing JWT with secret length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'MISSING');
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Token generated');
    res.json({ token });
  } catch (error) {
    console.error('Login error CAUGHT:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

exports.dashboard = (req, res) => {
  res.json({ message: 'Welcome to admin dashboard' });
};