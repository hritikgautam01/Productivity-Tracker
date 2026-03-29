import { useState } from 'react';
import { Check, Trash2, Plus, Clock } from 'lucide-react';

const TaskManager = ({ tasks, onAddTask, onToggleTask, onDeleteTask }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [setTime, setSetTime] = useState(false);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        onAddTask(newTaskTitle, today, setTime ? startTime : null, setTime ? endTime : null);
        setNewTaskTitle('');
        setSetTime(false);
        setStartTime('09:00');
        setEndTime('10:00');
    };

    const formatTime = (t) => {
        if (!t) return '';
        const [h, m] = t.split(':');
        const d = new Date();
        d.setHours(+h, +m);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Today's Tasks</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage what you need to do today.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {todayTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-3">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Check size={24} className="text-gray-300 dark:text-gray-400" />
                        </div>
                        <p>No tasks for today. Add one below!</p>
                    </div>
                ) : (
                    <ul className="space-y-2 p-2">
                        {todayTasks.map(task => (
                            <li
                                key={task._id}
                                className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 border ${
                                    task.completed
                                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-75'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button
                                        onClick={() => onToggleTask(task._id, !task.completed)}
                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            task.completed
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-gray-300 dark:border-gray-500 text-transparent hover:border-primary-500 dark:hover:border-primary-400'
                                        }`}
                                    >
                                        <Check size={14} strokeWidth={3} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm font-medium transition-all block truncate ${
                                            task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'
                                        }`}>
                                            {task.title}
                                        </span>
                                        {task.startTime && task.endTime && (
                                            <span className="flex items-center gap-1 text-xs text-primary-500 dark:text-primary-400 mt-0.5">
                                                <Clock size={10} />
                                                {formatTime(task.startTime)} – {formatTime(task.endTime)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDeleteTask(task._id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
                <form onSubmit={handleAdd} className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Add a new task..."
                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newTaskTitle.trim()}
                            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Optional time toggle */}
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div
                                onClick={() => setSetTime(!setTime)}
                                className={`w-8 h-4 rounded-full transition-colors relative ${setTime ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${setTime ? 'left-4' : 'left-0.5'}`} />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock size={11} /> Set Time
                            </span>
                        </label>
                    </div>

                    {setTime && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default TaskManager;
