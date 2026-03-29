import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('light');
    const navigate = useNavigate();

    const fetchUserProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            // Merge existing auth data (token) with fresh profile data (streaks, theme)
            setUser(prevUser => ({...prevUser, ...data}));
            
            if (data.themePreference) {
                setTheme(data.themePreference);
                applyTheme(data.themePreference);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        }
    };

    const applyTheme = (newTheme) => {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
        
        if (user) {
            try {
                await api.put('/users/theme', { theme: newTheme });
            } catch (error) {
                console.error('Failed to save theme preference:', error);
            }
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // Wait until next tick to make sure axios intercepts correctly if token is fresh
            setTimeout(() => {
                fetchUserProfile();
            }, 0);
        } else {
            setLoading(false);
        }
    }, []);

    // Ensure we stop loading once user context is somewhat resolved
    useEffect(() => {
        if (user !== null || !localStorage.getItem('user')) {
            setLoading(false);
        }
    }, [user]);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/');
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/signup', { name, email, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/');
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, theme, toggleTheme, refreshUser: fetchUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
