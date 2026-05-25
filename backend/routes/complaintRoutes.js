const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, authorityProtect } = require('../middleware/authMiddleware');
const { sendEmailNotification } = require('../utils/notificationService');

// @route POST /api/complaints
// @desc Create a new complaint (Citizen)
router.post('/', protect, async (req, res) => {
  try {
    const { category, description, location, imageUrl } = req.body;

    // Simulate AI Enhancement Placeholder
    const aiEnhancedDescription = `[AI ENHANCED] ${description} - This issue requires attention regarding ${category}. It's located at coordinates (${location.lat}, ${location.lng}).`;

    const complaint = await Complaint.create({
      citizenId: req.user.id,
      category,
      description,
      aiEnhancedDescription,
      lat: location.lat,
      lng: location.lng,
      address: location.address,
      imageUrl,
      status: 'Pending',
      priorityScore: Math.floor(Math.random() * 10) + 1 // mock AI priority
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error("Create Complaint Error:", error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route GET /api/complaints/my
// @desc Get logged in citizen's complaints
router.get('/my', protect, async (req, res) => {
  try {
    const complaints = await Complaint.findAll({ 
      where: { citizenId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/complaints
// @desc Get all complaints (Authorities only)
router.get('/', protect, authorityProtect, async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [
        { model: User, as: 'citizen', attributes: ['name', 'phone', 'email'] },
        { model: User, as: 'assignedOfficer', attributes: ['name'] }
      ],
      order: [
        ['priorityScore', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });
    res.json(complaints);
  } catch (error) {
    console.error("Fetch Complaints Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/complaints/:id
// @desc Get a single complaint (for tracking view)
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [
        { model: User, as: 'citizen', attributes: ['name', 'phone', 'email'] },
        { model: User, as: 'assignedOfficer', attributes: ['name', 'role'] }
      ]
    });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/complaints/:id/accept
// @desc Accept a complaint (Authority only)
router.put('/:id/accept', protect, authorityProtect, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: User, as: 'citizen', attributes: ['email', 'name'] }]
    });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = 'Accepted';
    complaint.assignedTo = req.user.id;
    await complaint.save();

    // FETCH AUTHORITY DETAILS
    const authority = await User.findByPk(req.user.id);
    const authName = authority ? authority.name : "Assigned Officer";
    const authPhone = authority ? authority.phone : "N/A";
    const authDept = authority?.area ? `${authority.area} Department` : "Municipal Authority";

    // SEND REAL EMAIL NOTIFICATION
    if (complaint.citizen && complaint.citizen.email) {
      await sendEmailNotification({
        to: complaint.citizen.email,
        subject: `[Accepted] Your Civic Complaint #${complaint.id.toString().slice(-6)}`,
        body: `We have reviewed your complaint regarding "${complaint.category}" and it has been ACCEPTED. A field team is being assigned immediately to address the issue.`,
        complaintData: {
          id: complaint.id,
          citizenName: complaint.citizen.name,
          category: complaint.category,
          address: complaint.address,
          status: 'Accepted',
          imageUrl: complaint.imageUrl
        },
        authorityDetails: {
          name: authName,
          department: authDept,
          phone: authPhone
        }
      });
    }

    res.json(complaint);
  } catch (error) {
    console.error("Accept Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/complaints/:id/resolve
// @desc Resolve a complaint (Authority only)
router.put('/:id/resolve', protect, authorityProtect, async (req, res) => {
  try {
    const { resolvedImageUrl, resolutionNote } = req.body;
    
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: User, as: 'citizen', attributes: ['email', 'name'] }]
    });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = 'Verification Pending';
    complaint.resolvedImageUrl = resolvedImageUrl;
    complaint.resolutionNote = resolutionNote;
    await complaint.save();

    // FETCH AUTHORITY DETAILS
    const authority = await User.findByPk(req.user.id);
    const authName = authority ? authority.name : "Assigned Officer";
    const authPhone = authority ? authority.phone : "N/A";
    const authDept = authority?.area ? `${authority.area} Department` : "Municipal Authority";

    // SEND REAL EMAIL NOTIFICATION
    if (complaint.citizen && complaint.citizen.email) {
      await sendEmailNotification({
        to: complaint.citizen.email,
        subject: `[Pending Verification] Your Civic Complaint #${complaint.id.toString().slice(-6)}`,
        body: `Great news! Our field teams have addressed your report. Please review the resolution and VERIFY the fix to officially close the case.`,
        complaintData: {
          id: complaint.id,
          citizenName: complaint.citizen.name,
          category: complaint.category,
          address: complaint.address,
          status: 'Verification Pending',
          resolutionNote: resolutionNote,
          imageUrl: resolvedImageUrl || complaint.imageUrl
        },
        authorityDetails: {
          name: authName,
          department: authDept,
          phone: authPhone
        }
      });
    }

    res.json(complaint);
  } catch (error) {
    console.error("Resolve Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/complaints/:id/status
// @desc Update complaint status (Authority only)
router.put('/:id/status', protect, authorityProtect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: User, as: 'citizen', attributes: ['email', 'name'] }]
    });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status;
    if (note) complaint.resolutionNote = note; 
    await complaint.save();

    // FETCH AUTHORITY DETAILS
    const authority = await User.findByPk(req.user.id);
    const authName = authority ? authority.name : "Assigned Officer";
    const authPhone = authority ? authority.phone : "N/A";
    const authDept = authority?.area ? `${authority.area} Department` : "Municipal Authority";

    // SEND REAL EMAIL NOTIFICATION
    if (complaint.citizen && complaint.citizen.email) {
      await sendEmailNotification({
        to: complaint.citizen.email,
        subject: `[${status}] Update on Your Civic Complaint #${complaint.id.toString().slice(-6)}`,
        body: `Your complaint status has been updated to: ${status.toUpperCase()}. Progress is currently being monitored by our regional office.`,
        complaintData: {
          id: complaint.id,
          citizenName: complaint.citizen.name,
          category: complaint.category,
          address: complaint.address,
          status: status,
          resolutionNote: note,
          imageUrl: complaint.imageUrl
        },
        authorityDetails: {
          name: authName,
          department: authDept,
          phone: authPhone
        }
      });
    }

    res.json(complaint);
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/complaints/:id/verify
// @desc Verify a resolution (Citizen only)
router.put('/:id/verify', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    // Check if user is the owner
    if (complaint.citizenId !== req.user.id) {
       return res.status(403).json({ message: 'Authorization denied: Ownership mismatch' });
    }

    if (complaint.status !== 'Verification Pending') {
       return res.status(400).json({ message: "Only issues in 'Verification Pending' can be verified." });
    }

    complaint.status = 'Resolved';
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
