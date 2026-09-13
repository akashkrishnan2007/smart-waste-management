import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdMenu, MdSearch, MdNotificationsNone, MdLightMode,
  MdDarkMode, MdPerson, MdSettings, MdLogout, MdArrowDropDown,
} from 'react-icons/md';
import useLocalStorage from '../../hooks/useLocalStorage';

const notifications = [
  { id: 1, text: 'Landfill capacity alert in Delhi',      time: '5m ago',  unread: true,  type: 'warning' },
  { id: 2, text: 'Monthly report ready for download',     time: '1h ago',  unread: true,  type: 'info'    },
  { id: 3, text: 'Recycling rate improved in Pune',       time: '3h ago',  unread: false, type: 'success' },
  { id: 4, text: 'New waste data imported successfully',  time: '1d ago',  unread: false, type: 'info'    },
];

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState('');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Toggle dark mode on <html> element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const notifColors = { warning: 'bg-yellow-100', info: 'bg-blue-100', success: 'bg-green-100' };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      {/* Left — hamburger + search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <MdMenu size={22} />
        </button>

        <div className="relative hidden sm:block">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cities, reports..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 w-56 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white focus:w-72 transition-all duration-300"
          />
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <MdNotificationsNone size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <p className="font-semibold text-sm text-textPrimary">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-xs text-primary-600 font-medium">{unreadCount} new</span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 ${n.unread ? 'bg-primary-50/40' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? 'bg-primary-500' : 'bg-slate-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-textPrimary leading-snug">{n.text}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100">
                  <button className="text-xs text-primary-600 font-medium hover:underline w-full text-center">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 gradient-green rounded-full flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-textPrimary leading-tight">Admin</p>
              <p className="text-[10px] text-slate-400">Administrator</p>
            </div>
            <MdArrowDropDown className="text-slate-400 hidden md:block" size={20} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-textPrimary">Admin User</p>
                  <p className="text-xs text-slate-400">admin@smartwaste.in</p>
                </div>
                <div className="py-1">
                  {[
                    { icon: MdPerson,   label: 'My Profile',  action: () => navigate('/profile')  },
                    { icon: MdSettings, label: 'Settings',    action: () => navigate('/settings') },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      onClick={() => { action(); setShowProfile(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Icon size={17} className="text-slate-400" />
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <MdLogout size={17} />
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
