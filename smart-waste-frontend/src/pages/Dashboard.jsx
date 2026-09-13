import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdDeleteOutline, MdRecycling, MdLocationCity,
  MdAttachMoney, MdEmojiEvents, MdArrowForward,
  MdPlayArrow, MdFileDownload, MdAdd, MdBarChart,
  MdWarning, MdError, MdCheckCircle, MdInfo,
  MdNotificationsActive,
} from 'react-icons/md';
import StatCard from '../components/cards/StatCard';
import WasteLineChart from '../components/charts/WasteLineChart';
import WastePieChart from '../components/charts/WastePieChart';
import WasteBarChart from '../components/charts/WasteBarChart';
import RecyclingChart from '../components/charts/RecyclingChart';
import { getActivityColor } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SEVERITY_CONFIG = {
  CRITICAL: { icon: MdError,         color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700'    },
  HIGH:     { icon: MdWarning,       color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  MEDIUM:   { icon: MdInfo,          color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
  LOW:      { icon: MdCheckCircle,   color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'   },
};

const quickActions = [
  { label: 'Add Waste Record', icon: MdAdd,          color: 'bg-primary-50 text-primary-700', path: '/waste-data'  },
  { label: 'Run Prediction',   icon: MdPlayArrow,    color: 'bg-blue-50 text-blue-700',        path: '/prediction'  },
  { label: 'Generate Report',  icon: MdFileDownload, color: 'bg-purple-50 text-purple-700',    path: '/reports'     },
  { label: 'View Analytics',   icon: MdBarChart,     color: 'bg-orange-50 text-orange-700',    path: '/analytics'   },
];

const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <motion.div
    className={`card ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="font-semibold text-textPrimary">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [summary, setSummary]           = useState(null);
  const [alerts, setAlerts]             = useState([]);
  const [highRiskCities, setHighRiskCities] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, alertsRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/alerts'),
        ]);
        // api interceptor returns response.data (Flask body); inner data is at .data
        setSummary(summaryRes?.data || summaryRes);
        const alertPayload = alertsRes?.data || alertsRes;
        setAlerts(alertPayload?.alerts || []);
        setHighRiskCities(alertPayload?.high_risk_cities || 0);
      } catch (err) {
        console.error('Dashboard data fetch failed:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Waste Generated',
      value: summary ? `${Number(summary.totalWasteGenerated)?.toLocaleString()} T` : '—',
      subtitle: 'from dataset',
      icon: MdDeleteOutline,
      gradient: 'gradient-green',
      trend: 'up',
      trendValue: 'Dataset',
      delay: 0,
    },
    {
      title: 'Avg Recycling Rate',
      value: summary ? `${summary.avgRecyclingRate?.toFixed(1)}%` : '—',
      subtitle: 'across all cities',
      icon: MdRecycling,
      gradient: 'gradient-teal',
      trend: summary?.avgRecyclingRate >= 50 ? 'up' : 'down',
      trendValue: summary?.avgRecyclingRate >= 50 ? 'On target' : 'Below target',
      delay: 0.08,
    },
    {
      title: 'Total Cities Monitored',
      value: summary ? summary.totalCities : '—',
      subtitle: 'active monitoring',
      icon: MdLocationCity,
      gradient: 'gradient-blue',
      trend: 'flat',
      trendValue: 'Stable',
      delay: 0.16,
    },
    {
      title: 'Avg Management Cost',
      value: summary ? `₹${summary.avgManagementCost?.toFixed(0)}` : '—',
      subtitle: 'per tonne',
      icon: MdAttachMoney,
      gradient: 'gradient-orange',
      trend: 'flat',
      trendValue: 'Dataset avg',
      delay: 0.24,
    },
    {
      title: 'High Risk Cities',
      value: loadingStats ? '—' : highRiskCities,
      subtitle: 'requiring attention',
      icon: MdWarning,
      gradient: highRiskCities > 5 ? 'bg-red-500' : 'gradient-purple',
      trend: highRiskCities > 5 ? 'up' : 'flat',
      trendValue: highRiskCities > 0 ? 'Needs action' : 'All clear',
      delay: 0.32,
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Banner */}
      <motion.div
        className="gradient-green rounded-2xl p-6 text-white overflow-hidden relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <MdRecycling className="text-[220px] -mt-8 ml-8" />
        </div>
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">{greeting},</p>
          <h1 className="text-2xl font-bold mt-0.5">{user.name || 'Admin User'} 👋</h1>
          <p className="text-white/70 text-sm mt-1.5 max-w-md">
            Here's what's happening with India's waste management.
            {summary && (
              <span className="font-semibold text-white"> {Number(summary.totalWasteGenerated)?.toLocaleString()} tonnes</span>
            )} generated across {summary?.totalCities || '—'} cities.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-white/15 rounded-xl px-4 py-2">
              <p className="text-white/70 text-xs">Last Updated</p>
              <p className="font-semibold text-sm">Today, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2">
              <p className="text-white/70 text-xs">Avg Recycling</p>
              <p className="font-semibold text-sm">{summary ? `${summary.avgRecyclingRate?.toFixed(1)}%` : '—'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Waste Generation Trend" subtitle="Monthly breakdown by type — 2023" className="lg:col-span-2">
          <WasteLineChart />
        </ChartCard>
        <ChartCard title="Waste Type Distribution" subtitle="Percentage breakdown">
          <WastePieChart />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Top Cities — Waste Overview" subtitle="Total vs Recycled vs Landfill (tonnes)">
          <WasteBarChart />
        </ChartCard>
        <ChartCard title="Recycling Rate by City" subtitle="vs 60% national target">
          <RecyclingChart />
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Smart Alerts */}
        <motion.div
          className="card lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <MdNotificationsActive className="text-orange-500 text-xl" />
              <div>
                <h3 className="font-semibold text-textPrimary">Smart Alerts</h3>
                <p className="text-xs text-slate-400">Generated from real waste dataset values</p>
              </div>
            </div>
            {alerts.length > 0 && (
              <span className="badge bg-orange-100 text-orange-700">{alerts.length} alerts</span>
            )}
          </div>

          {alerts.length === 0 && !loadingStats ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MdCheckCircle className="text-green-400 text-4xl mb-2" />
              <p className="text-slate-400 text-sm">No critical alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, i) => {
                const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.LOW;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Icon className={`${cfg.color} text-lg flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-textPrimary">{alert.title}</p>
                        <span className={`badge ${cfg.badge} text-[10px]`}>{alert.severity}</span>
                      </div>
                      <p className="text-xs text-slate-600">{alert.message}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{alert.city}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-semibold text-textPrimary mb-5">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((a, i) => (
              <motion.button
                key={a.label}
                onClick={() => navigate(a.path)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl ${a.color} hover:opacity-80 transition-all text-left`}
                whileHover={{ x: 4 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <div className="w-9 h-9 bg-white/70 rounded-lg flex items-center justify-center">
                  <a.icon size={20} />
                </div>
                <span className="font-medium text-sm">{a.label}</span>
                <MdArrowForward className="ml-auto opacity-60" size={16} />
              </motion.button>
            ))}
          </div>

          {/* Live summary from API */}
          <div className="mt-5 p-4 bg-gradient-to-br from-primary-50 to-teal-50 rounded-xl">
            <p className="text-xs font-semibold text-primary-700 mb-3">Dataset Summary</p>
            {[
              { label: 'Total Records',    value: summary ? `${summary.totalCities * 5}+` : '—' },
              { label: 'Avg Efficiency',   value: summary ? `${summary.municipalEfficiencyScore?.toFixed(1)}/10` : '—' },
              { label: 'High Risk Cities', value: loadingStats ? '—' : highRiskCities },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-xs py-1.5 border-b border-white/60 last:border-0">
                <span className="text-slate-500">{item.label}</span>
                <span className="font-semibold text-textPrimary">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
