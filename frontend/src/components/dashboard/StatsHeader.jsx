import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import StreakWidget from './StreakWidget';

// Top header summarizing today's stats
const StatsHeader = ({ tasks }) => {
    const { user } = useContext(AuthContext);
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    const completedToday = todayTasks.filter(t => t.completed).length;
    const totalToday = todayTasks.length;
    
    let productivityPercentage = 0;
    if (totalToday > 0) {
        productivityPercentage = Math.round((completedToday / totalToday) * 100);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center transition-colors">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Today's Productivity</h3>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{productivityPercentage}%</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">efficiency</span>
                </div>
            </div>

            <StreakWidget currentStreak={user?.currentStreak} longestStreak={user?.longestStreak} />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center transition-colors">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Completed Tasks</h3>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-green-600 dark:text-green-500">{completedToday}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">tasks done</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center transition-colors">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Pending Tasks</h3>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-orange-500 dark:text-orange-400">{totalToday - completedToday}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">tasks remaining</span>
                </div>
            </div>
        </div>
    );
};

export default StatsHeader;
