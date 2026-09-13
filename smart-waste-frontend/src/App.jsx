import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes, Route, Navigate, useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Layout
import Navbar  from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer  from './components/layout/Footer';

// Pages
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import WasteData  from './pages/WasteData';
import Analytics  from './pages/Analytics';
import Prediction from './pages/Prediction';
import Landfills  from './pages/Landfills';
import Reports    from './pages/Reports';
import Profile    from './pages/Profile';
import Settings   from './pages/Settings';
import NotFound   from './pages/NotFound';

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

// Protected route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

// Dashboard layout (with sidebar + navbar)
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-poppins">
      {/* Sidebar — desktop (static) or mobile (drawer) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
};

// Animated routes inside dashboard
const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <PageTransition><Dashboard /></PageTransition>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/waste-data"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <PageTransition><WasteData /></PageTransition>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <PageTransition><Analytics /></PageTransition>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/prediction"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <PageTransition><Prediction /></PageTransition>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/landfills"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <PageTransition><Landfills /></PageTransition>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <PageTransition><Reports /></PageTransition>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <PageTransition><Profile /></PageTransition>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <PageTransition><Settings /></PageTransition>
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
