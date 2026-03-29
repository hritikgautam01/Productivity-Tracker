const StreakWidget = ({ currentStreak, longestStreak }) => {
    return (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 text-orange-400 opacity-30">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 2c0 0-5 2.5-5 9 0 3.5 2.5 5 2.5 5s-1.5-1.5-1-4c0 0 4 5 4 8 0-3.5 2-4 2-6 0-3-2.5-12-2.5-12z" />
                </svg>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h3 className="text-orange-100 text-sm font-medium mb-1">Current Streak</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{currentStreak || 0}</span>
                        <span className="text-sm text-orange-200 mb-1">days 🔥</span>
                    </div>
                </div>
                
                <div className="text-right border-l border-white/20 pl-4">
                    <h3 className="text-orange-100 text-xs font-medium mb-1 uppercase tracking-wider">Longest</h3>
                    <div className="text-xl font-bold">{longestStreak || 0}</div>
                </div>
            </div>
        </div>
    );
};

export default StreakWidget;
