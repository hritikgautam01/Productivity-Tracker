const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/users/theme
router.put('/theme', protect, async (req, res) => {
    const { theme } = req.body;
    
    if (!['light', 'dark'].includes(theme)) {
        return res.status(400).json({ message: 'Invalid theme' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.themePreference = theme;
            await user.save();
            res.json({ themePreference: user.themePreference });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
