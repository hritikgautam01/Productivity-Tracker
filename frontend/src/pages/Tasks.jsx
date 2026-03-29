import Sidebar from '../components/layout/Sidebar';
import TaskManager from '../components/tasks/TaskManager';
import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const Tasks = () => {
    const { refreshUser } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    
    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks for Tasks Page:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAddTask = async (title, date, startTime = null, endTime = null) => {
        await api.post('/tasks', { title, date, startTime, endTime });
        fetchTasks();
    };

    const handleToggleTask = async (id, completed) => {
        // Optimistic update — flip immediately so UI responds instantly
        setTasks(prev => prev.map(t => t._id === id ? { ...t, completed } : t));
        try {
            await api.put(`/tasks/${id}`, { completed });
            fetchTasks(); // Sync with server
            if (completed) refreshUser(); // Refresh streak data
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert on failure
            setTasks(prev => prev.map(t => t._id === id ? { ...t, completed: !completed } : t));
        }
    };

    const handleDeleteTask = async (id) => {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors">
            <Sidebar />
            <div className="flex-1 overflow-auto p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">All Tasks</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage everything you need to get done.</p>
                </header>
                <div className="max-w-4xl h-[600px]">
                     <TaskManager 
                        tasks={tasks} 
                        onAddTask={handleAddTask} 
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                    />
                </div>
            </div>
        </div>
    );
};

export default Tasks;
