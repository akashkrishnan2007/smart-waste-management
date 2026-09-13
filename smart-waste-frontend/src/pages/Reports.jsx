import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  MdFileDownload, MdAdd, MdPictureAsPdf, MdTableChart,
  MdCheckCircle, MdSchedule, MdSearch,
} from 'react-icons/md';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Select } from '../components/common/Input';
import { reportsData, yearlyTrendData } from '../utils/dummyData';
import { CITIES, WASTE_TYPES, YEARS } from '../utils/constants';

const REPORT_TYPES = ['Annual', 'Quarterly', 'Monthly', 'Custom', 'Analytics'];

const Reports = () => {
  const [reports, setReports]     = useState(reportsData);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState('');
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', city: '', year: '', wasteType: '' });

  const filtered = reports.filter((r) =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = async () => {
    if (!form.name || !form.type) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setReports((prev) => [
      {
        id: Date.now(),
        name:        form.name,
        type:        form.type,
        generatedBy: 'Admin',
        date:        new Date().toISOString().split('T')[0],
        size:        `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
        status:      'Ready',
      },
      ...prev,
    ]);
    setGenerating(false);
    setShowModal(false);
    setForm({ name: '', type: '', city: '', year: '', wasteType: '' });
  };

  const typeColors = {
    Annual:    'bg-green-100 text-green-800',
    Quarterly: 'bg-blue-100 text-blue-800',
    Monthly:   'bg-yellow-100 text-yellow-800',
    Custom:    'bg-purple-100 text-purple-800',
    Analytics: 'bg-teal-100 text-teal-800',
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Generate, manage, and download analysis reports</p>
        </div>
        <Button icon={<MdAdd />} onClick={() => setShowModal(true)}>
          Generate Report
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports',    value: reports.length,                                    color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Generated Today',  value: reports.filter((r) => r.date === new Date().toISOString().split('T')[0]).length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Annual Reports',   value: reports.filter((r) => r.type === 'Annual').length, color: 'text-purple-600',  bg: 'bg-purple-50'  },
          { label: 'Custom Reports',   value: reports.filter((r) => r.type === 'Custom').length, color: 'text-orange-600',  bg: 'bg-orange-50'  },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className={`card text-center ${s.bg}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3 }}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="font-semibold text-textPrimary mb-4">Waste Generated vs Recycled — Yearly</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearlyTrendData} barSize={20} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v, n) => [`${v.toLocaleString()} T`, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="totalWaste" name="Total Waste" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recycled"   name="Recycled"    fill="#14B8A6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-semibold text-textPrimary mb-4">Landfill vs Recycled — Yearly</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearlyTrendData} barSize={20} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v, n) => [`${v.toLocaleString()} T`, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="landfill" name="Landfill"  fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recycled" name="Recycled"  fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Reports Table */}
      <motion.div
        className="card p-0 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-4 flex-wrap">
          <h3 className="font-semibold text-textPrimary">Recent Reports</h3>
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="input-field pl-9 py-2 text-sm w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Report Name', 'Type', 'Generated By', 'Date', 'Size', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr
                  key={r.id}
                  className="hover:bg-slate-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td className="table-cell font-medium text-textPrimary max-w-[220px] truncate">{r.name}</td>
                  <td className="table-cell">
                    <span className={`badge ${typeColors[r.type] ?? 'bg-gray-100 text-gray-700'}`}>{r.type}</span>
                  </td>
                  <td className="table-cell text-slate-500">{r.generatedBy}</td>
                  <td className="table-cell text-slate-500">{r.date}</td>
                  <td className="table-cell text-slate-500">{r.size}</td>
                  <td className="table-cell">
                    <span className={`badge flex items-center gap-1 w-fit ${r.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.status === 'Ready' ? <MdCheckCircle size={12} /> : <MdSchedule size={12} />}
                      {r.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <MdPictureAsPdf size={15} />
                        PDF
                      </button>
                      <button
                        className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 px-2 py-1.5 rounded-lg transition-colors"
                        title="Download Excel"
                      >
                        <MdTableChart size={15} />
                        XLS
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Generate Report Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Generate New Report"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={generating} onClick={handleGenerate} icon={<MdAdd />}>
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-textPrimary">Report Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Q1 2024 Waste Summary"
              className="input-field"
            />
          </div>
          <Select label="Report Type" name="type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} options={REPORT_TYPES} placeholder="Select type" required />
          <Select label="City (optional)" name="city" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} options={CITIES} placeholder="All Cities" />
          <Select label="Year (optional)" name="year" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} options={YEARS} placeholder="All Years" />
          <Select label="Waste Type (optional)" name="wasteType" value={form.wasteType} onChange={(e) => setForm((p) => ({ ...p, wasteType: e.target.value }))} options={WASTE_TYPES} placeholder="All Types" />

          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
            <span>ℹ️</span>
            <span>Reports include charts, tables, and insights based on your selected filters.</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;
