const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const bcrypt = require('bcryptjs');
const { generateToken, protect } = require('../middleware/authMiddleware');

// @route POST /api/auth/register
// @desc Register citizen or authority
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, city, area } = req.body;
    
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name, email, password: hashedPassword, role: role || 'citizen', phone, city, area
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route POST /api/auth/login
// @desc Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for: ${email}`);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`[AUTH] Login failed: User not found for ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[AUTH] Login failed: Password mismatch for ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`[AUTH] Login successful for: ${email} (Role: ${user.role})`);
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route GET /api/auth/profile
// @desc Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route POST /api/auth/seed
// @desc Seed demo data for testing
router.post('/seed', async (req, res) => {
  try {
    // Clear existing data (Note: In production use migrations or controlled seeding)
    await Complaint.destroy({ where: {}, truncate: { cascade: true } });
    await User.destroy({ where: {}, truncate: { cascade: true } });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create Demo Citizen
    const citizen = await User.create({
      name: 'John Citizen',
      email: 'citizen@example.com',
      password: hashedPassword,
      role: 'citizen',
      phone: '9876543210',
      city: 'Hyderabad',
      area: 'Banjara Hills'
    });

    // Create Demo Authority
    const authority = await User.create({
      name: 'Officer Ram',
      email: 'authority@example.com',
      password: hashedPassword,
      role: 'authority',
      phone: '8888877777',
      city: 'Hyderabad',
      area: 'Central Zone'
    });

    // Create Demo Complaint
    const complaint = await Complaint.create({
      citizenId: citizen.id,
      category: 'Drainage',
      description: 'Major block in Sector 4, water overflowing onto main road.',
      lat: 17.3850,
      lng: 78.4867,
      address: 'Sector 4, Banjara Hills, Hyderabad',
      status: 'Pending',
      priorityScore: 9,
      imageUrl: 'https://via.placeholder.com/150'
    });

    res.json({ 
      success: true, 
      message: 'Demo data seeded successfully in MySQL',
      credentials: {
        citizen: 'citizen@example.com / admin123',
        authority: 'authority@example.com / admin123'
      },
      newComplaintId: complaint.id
    });
  } catch (error) {
    console.error("Seeding error:", error);
    res.status(500).json({ message: 'Seeding error: ' + error.message });
  }
});

module.exports = router;
