const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Helper function to calculate productivity from tasks
const calculateProductivity = (tasks) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return (completed / tasks.length) * 100;
};

// GET /api/productivity/daily
// Gets productivity for the last 7 days
router.get('/daily', async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user._id }).sort({ date: 1 });
        
        // Group by date
        const grouped = {};
        tasks.forEach(task => {
            if (!grouped[task.date]) grouped[task.date] = [];
            grouped[task.date].push(task);
        });

        // Get last 7 unique dates or just recent dates
        const dates = Object.keys(grouped).sort().slice(-7);
        
        const data = dates.map(date => ({
            name: date, // 'name' maps easily to Recharts X-axis
            productivity: calculateProductivity(grouped[date]),
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/productivity/weekly
// For simplicity, we'll group by week number
router.get('/weekly', async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user._id }).sort({ date: 1 });
        
        const grouped = {};
        tasks.forEach(task => {
            const dateObj = new Date(task.date);
            // Get ISO week string, e.g. "2023-W41"
            const weekPrefix = `${dateObj.getFullYear()}-W${Math.ceil(dateObj.getDate() / 7)}`; 
            // Better simpler grouping: just use month-week
            const weekKey = `${dateObj.toLocaleString('default', { month: 'short' })} W${Math.ceil(dateObj.getDate() / 7)}`;

            if (!grouped[weekKey]) grouped[weekKey] = [];
            grouped[weekKey].push(task);
        });

        const data = Object.keys(grouped).slice(-4).map(week => ({
            name: week,
            productivity: calculateProductivity(grouped[week]),
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/productivity/monthly
router.get('/monthly', async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user._id }).sort({ date: 1 });
        
        const grouped = {};
        tasks.forEach(task => {
            const dateObj = new Date(task.date);
            const monthKey = `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getFullYear()}`;

            if (!grouped[monthKey]) grouped[monthKey] = [];
            grouped[monthKey].push(task);
        });

        const data = Object.keys(grouped).slice(-6).map(month => ({
            name: month,
            productivity: calculateProductivity(grouped[month]),
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
