const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    date: {
        type: String, // Storing date as YYYY-MM-DD string for easier grouping
        required: true,
    },
    startTime: {
        type: String, // HH:mm format, optional
        default: null,
    },
    endTime: {
        type: String, // HH:mm format, optional
        default: null,
    },
    completed: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

