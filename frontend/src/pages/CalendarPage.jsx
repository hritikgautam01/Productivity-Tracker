import { useState, useEffect, useCallback, useContext } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { X, Clock, Trash2 } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

// ─── Modal for creating/editing tasks from calendar ─────────────────────────
const TaskModal = ({ slot, event, onSave, onDelete, onClose }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [startTime, setStartTime] = useState(
        event ? format(event.start, 'HH:mm') : format(slot?.start || new Date(), 'HH:mm')
    );
    const [endTime, setEndTime] = useState(
        event ? format(event.end, 'HH:mm') : format(slot?.end || addHours(new Date(), 1), 'HH:mm')
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave({ title, startTime, endTime });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {event ? 'Edit Task' : 'New Time Block'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Task Title</label>
                        <input
                            autoFocus
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block flex items-center gap-1.5">
                                <Clock size={13} /> Start Time
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block flex items-center gap-1.5">
                                <Clock size={13} /> End Time
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                        >
                            {event ? 'Save Changes' : 'Create Block'}
                        </button>
                        {event && (
                            <button
                                type="button"
                                onClick={() => onDelete(event.resource._id)}
                                className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Convert DB task → RBC event ────────────────────────────────────────────
const taskToEvent = (task) => {
    if (!task.startTime || !task.endTime) return null;
    const [sh, sm] = task.startTime.split(':').map(Number);
    const [eh, em] = task.endTime.split(':').map(Number);
    const base = new Date(task.date + 'T00:00:00');
    return {
        id: task._id,
        title: task.title,
        start: new Date(base.getFullYear(), base.getMonth(), base.getDate(), sh, sm),
        end:   new Date(base.getFullYear(), base.getMonth(), base.getDate(), eh, em),
        resource: task,
    };
};

// ─── Main Calendar Page ───────────────────────────────────────────────────────
const CalendarPage = () => {
    const { theme } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [modalState, setModalState] = useState(null); // { type: 'slot'|'event', slot?, event? }
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('week');

    const fetchTasks = useCallback(async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
            setEvents(data.map(taskToEvent).filter(Boolean));
        } catch (err) {
            console.error('Calendar fetch error:', err);
        }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    // Drag across empty slots → open create modal
    const handleSelectSlot = useCallback(({ start, end }) => {
        setModalState({ type: 'slot', slot: { start, end } });
    }, []);

    // Click existing event → open edit modal
    const handleSelectEvent = useCallback((event) => {
        setModalState({ type: 'event', event });
    }, []);

    // Drag event to new time
    const handleEventDrop = useCallback(async ({ event, start, end }) => {
        const date = format(start, 'yyyy-MM-dd');
        const startTime = format(start, 'HH:mm');
        const endTime = format(end, 'HH:mm');
        // Optimistic
        setEvents(prev => prev.map(e =>
            e.id === event.id ? { ...e, start, end } : e
        ));
        try {
            await api.put(`/tasks/${event.resource._id}`, { date, startTime, endTime });
            fetchTasks();
        } catch (err) {
            console.error('Move failed:', err);
            fetchTasks(); // revert
        }
    }, [fetchTasks]);

    // Resize event
    const handleEventResize = useCallback(async ({ event, start, end }) => {
        const startTime = format(start, 'HH:mm');
        const endTime = format(end, 'HH:mm');
        setEvents(prev => prev.map(e =>
            e.id === event.id ? { ...e, start, end } : e
        ));
        try {
            await api.put(`/tasks/${event.resource._id}`, { startTime, endTime });
            fetchTasks();
        } catch (err) {
            fetchTasks();
        }
    }, [fetchTasks]);

    const handleModalSave = async ({ title, startTime, endTime }) => {
        const { type, slot, event } = modalState;
        if (type === 'slot') {
            const date = format(slot.start, 'yyyy-MM-dd');
            await api.post('/tasks', { title, date, startTime, endTime });
        } else {
            await api.put(`/tasks/${event.resource._id}`, { title, startTime, endTime });
        }
        setModalState(null);
        fetchTasks();
    };

    const handleModalDelete = async (id) => {
        await api.delete(`/tasks/${id}`);
        setModalState(null);
        fetchTasks();
    };

    // Colour by completion
    const eventStyleGetter = (event) => {
        const completed = event.resource?.completed;
        return {
            style: {
                backgroundColor: completed ? '#22c55e' : '#3b82f6',
                borderColor: completed ? '#16a34a' : '#2563eb',
                borderRadius: '8px',
                color: '#fff',
                border: 'none',
                fontSize: '12px',
                fontWeight: '500',
            }
        };
    };

    const isDark = theme === 'dark';

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors">
            <Sidebar />
            <div className="flex-1 overflow-auto p-6">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Time Block Calendar</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Drag to create blocks · Click to edit · Green = complete · Blue = pending
                    </p>
                </header>

                {/* Calendar */}
                <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? 'calendar-dark border-gray-700' : 'border-gray-200'}`}
                     style={{ height: 'calc(100vh - 200px)' }}>
                    <DnDCalendar
                        localizer={localizer}
                        events={events}
                        date={currentDate}
                        view={currentView}
                        onNavigate={setCurrentDate}
                        onView={setCurrentView}
                        selectable
                        resizable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventResize}
                        eventPropGetter={eventStyleGetter}
                        views={['month', 'week', 'day']}
                        defaultView="week"
                        step={15}
                        timeslots={4}
                        style={{ height: '100%' }}
                        popup
                    />
                </div>
            </div>

            {/* Modal */}
            {modalState && (
                <TaskModal
                    slot={modalState.type === 'slot' ? modalState.slot : null}
                    event={modalState.type === 'event' ? modalState.event : null}
                    onSave={handleModalSave}
                    onDelete={handleModalDelete}
                    onClose={() => setModalState(null)}
                />
            )}
        </div>
    );
};

export default CalendarPage;
