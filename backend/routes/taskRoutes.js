const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes are protected
router.use(protect);

// GET /api/tasks
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = { userId: req.user._id };
        
        if (startDate && endDate) {
            // Return tasks within date range (for calendar)
            filter.date = { $gte: startDate, $lte: endDate };
        }
        
        const tasks = await Task.find(filter).sort({ date: -1, createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/tasks
router.post('/', async (req, res) => {
    const { title, date, startTime, endTime } = req.body;

    if (!title || !date) {
        return res.status(400).json({ message: 'Please provide title and date' });
    }

    try {
        const task = new Task({
            userId: req.user._id,
            title,
            date,
            startTime: startTime || null,
            endTime: endTime || null,
            completed: false,
        });

        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
    const { title, date, completed } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            if (task.userId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            // Check if marking as newly completed today
            const wasCompleted = task.completed;
            const isNowCompleted = completed !== undefined ? completed : task.completed;
            
            task.title = title !== undefined ? title : task.title;
            task.date = date !== undefined ? date : task.date;
            task.startTime = req.body.startTime !== undefined ? req.body.startTime : task.startTime;
            task.endTime = req.body.endTime !== undefined ? req.body.endTime : task.endTime;
            task.completed = isNowCompleted;

            const updatedTask = await task.save();

            // Streak Logic
            if (!wasCompleted && isNowCompleted) {
                const user = await require('../models/User').findById(req.user._id);
                const today = new Date().toISOString().split('T')[0];
                
                const lastCompleted = user.lastCompletedDate;
                
                if (lastCompleted !== today) {
                    if (lastCompleted) {
                        const lastDate = new Date(lastCompleted);
                        const currDate = new Date(today);
                        const diffTime = Math.abs(currDate - lastDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays === 1) {
                            user.currentStreak += 1;
                        } else if (diffDays > 1) {
                            user.currentStreak = 1;
                        }
                    } else {
                        user.currentStreak = 1; // First task ever completed
                    }
                    
                    if (user.currentStreak > user.longestStreak) {
                        user.longestStreak = user.currentStreak;
                    }
                    
                    user.lastCompletedDate = today;
                    await user.save();
                }
            }

            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            if (task.userId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            await task.deleteOne();
            res.json({ message: 'Task removed' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
