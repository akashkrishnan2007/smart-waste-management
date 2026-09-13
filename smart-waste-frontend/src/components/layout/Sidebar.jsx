import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdDeleteOutline, MdBarChart, MdAutoGraph,
  MdLocationOn, MdAssignment, MdPerson, MdSettings,
  MdLogout, MdClose, MdRecycling,
} from 'react-icons/md';

const navItems = [
  { label: 'Dashboard',  path: '/dashboard',  icon: MdDashboard    },
  { label: 'Waste Data', path: '/waste-data',  icon: MdDeleteOutline },
  { label: 'Analytics',  path: '/analytics',  icon: MdBarChart     },
  { label: 'Prediction', path: '/prediction', icon: MdAutoGraph    },
  { label: 'Landfills',  path: '/landfills',  icon: MdLocationOn   },
  { label: 'Reports',    path: '/reports',    icon: MdAssignment   },
];

const bottomItems = [
  { label: 'Profile',  path: '/profile',  icon: MdPerson   },
  { label: 'Settings', path: '/settings', icon: MdSettings },
];

const sidebarVariants = {
  open:   { x: 0,    opacity: 1 },
  closed: { x: -280, opacity: 0 },
};

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 gradient-green rounded-xl flex items-center justify-center shadow-sm">
            <MdRecycling className="text-white text-xl" />
          </div>
          <div>
            <p className="font-bold text-primary-700 text-base leading-tight">SmartWaste</p>
            <p className="text-[10px] text-slate-400 leading-tight">Analytics System</p>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <MdClose size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Main Menu
        </p>
        <ul className="space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`text-xl flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mt-6 mb-2">
          Account
        </p>
        <ul className="space-y-1">
          {bottomItems.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`text-xl flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout + User info */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 bg-primary-50 rounded-xl mb-3">
          <div className="w-8 h-8 gradient-green rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-textPrimary truncate">Admin User</p>
            <p className="text-xs text-slate-400 truncate">admin@smartwaste.in</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <MdLogout className="text-xl flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  // Desktop sidebar
  if (!isMobile) {
    return (
      <aside className="w-64 h-screen bg-white shadow-sidebar flex-shrink-0 sticky top-0 overflow-hidden border-r border-slate-100">
        <SidebarContent />
      </aside>
    );
  }

  // Mobile sidebar (drawer)
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 lg:hidden overflow-hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <SidebarContent />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
