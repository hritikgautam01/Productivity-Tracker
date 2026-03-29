import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import Sidebar from '../components/layout/Sidebar';
import StatsHeader from '../components/dashboard/StatsHeader';
import TaskManager from '../components/tasks/TaskManager';
import ChartsSection from '../components/dashboard/ChartsSection';
import AiInsights from '../components/dashboard/AiInsights';

const Dashboard = () => {
    const { user, refreshUser } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [tasksRes, dailyRes, weeklyRes, monthlyRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/productivity/daily'),
                api.get('/productivity/weekly'),
                api.get('/productivity/monthly')
            ]);
            
            setTasks(tasksRes.data);
            setDailyData(dailyRes.data);
            setWeeklyData(weeklyRes.data);
            setMonthlyData(monthlyRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleAddTask = async (title, date, startTime = null, endTime = null) => {
        try {
            await api.post('/tasks', { title, date, startTime, endTime });
            fetchDashboardData();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleToggleTask = async (id, completed) => {
        // Optimistic update — flip immediately so UI responds instantly
        setTasks(prev => prev.map(t => t._id === id ? { ...t, completed } : t));
        try {
            await api.put(`/tasks/${id}`, { completed });
            fetchDashboardData(); // Sync charts/stats with server
            if (completed) refreshUser(); // Refresh streak data when completing
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert on failure
            setTasks(prev => prev.map(t => t._id === id ? { ...t, completed: !completed } : t));
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            fetchDashboardData(); // Refresh all data to update charts
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors">
            <Sidebar />
            
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Hello, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what your productivity looks like today.</p>
                    </header>

                    <StatsHeader tasks={tasks} />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                        <div className="xl:col-span-2 h-[450px]">
                            <TaskManager 
                                tasks={tasks} 
                                onAddTask={handleAddTask} 
                                onToggleTask={handleToggleTask}
                                onDeleteTask={handleDeleteTask}
                            />
                        </div>
                        <div className="xl:col-span-1 h-[450px]">
                            <AiInsights />
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Productivity Analytics</h2>
                        <ChartsSection 
                            dailyData={dailyData} 
                            weeklyData={weeklyData} 
                            monthlyData={monthlyData} 
                        />
                    </div>
                    
                    <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-400 dark:text-gray-600 transition-colors">
                        Advanced Productivity Tracker &copy; {new Date().getFullYear()}
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
