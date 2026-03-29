import { Sparkles } from 'lucide-react';

const AiInsights = () => {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3 items-start">
                        <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-indigo-900 mt-1">AI Productivity Insights</h3>
                    </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white mt-4">
                    <p className="text-indigo-800 text-sm italic">
                        "AI insights will appear here based on your productivity data."
                    </p>
                    <div className="mt-4 flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiInsights;
