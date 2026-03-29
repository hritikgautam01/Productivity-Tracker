import Sidebar from '../components/layout/Sidebar';
import ChartsSection from '../components/dashboard/ChartsSection';
import AiInsights from '../components/dashboard/AiInsights';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const Analytics = () => {
    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
                    api.get('/productivity/daily'),
                    api.get('/productivity/weekly'),
                    api.get('/productivity/monthly')
                ]);
                
                setDailyData(dailyRes.data);
                setWeeklyData(weeklyRes.data);
                setMonthlyData(monthlyRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

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
            <div className="flex-1 overflow-auto p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Advanced Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Deep dive into your productivity metrics.</p>
                </header>
                
                <div className="grid grid-cols-1 gap-8 max-w-6xl">
                    <ChartsSection 
                        dailyData={dailyData} 
                        weeklyData={weeklyData} 
                        monthlyData={monthlyData} 
                    />
                    <div className="h-64">
                         <AiInsights />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
