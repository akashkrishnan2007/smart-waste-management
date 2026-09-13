import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { Select } from '../components/common/Input';
import {
  cityWasteComparison, wasteTypeDistribution, yearlyTrendData,
  disposalMethodData, densityVsWasteData, wasteTrendData,
} from '../utils/dummyData';
import { CHART_COLORS, CHART_PALETTE, CITIES, YEARS } from '../utils/constants';

const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <motion.div
    className={`card ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="mb-5">
      <h3 className="font-semibold text-textPrimary">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-textPrimary mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [filters, setFilters] = useState({ city: '', year: '' });

  const summaryCards = [
    { label: 'Total Waste Analyzed',     value: '1,24,820 T', change: '+8.2%',  color: 'text-primary-600', bg: 'bg-primary-50'  },
    { label: 'Avg Recycling Rate',        value: '41.3%',      change: '+3.1%',  color: 'text-teal-600',    bg: 'bg-teal-50'     },
    { label: 'Cities Analyzed',           value: '15',         change: 'Stable', color: 'text-blue-600',    bg: 'bg-blue-50'     },
    { label: 'Waste Diverted from Landfill', value: '38.2%',  change: '+2.7%',  color: 'text-purple-600',  bg: 'bg-purple-50'   },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Deep-dive into waste management patterns and trends</p>
        </div>
        <div className="flex gap-3">
          <Select
            name="city"
            value={filters.city}
            onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
            options={CITIES}
            placeholder="All Cities"
          />
          <Select
            name="year"
            value={filters.year}
            onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}
            options={YEARS}
            placeholder="All Years"
          />
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c, i) => (
          <motion.div
            key={c.label}
            className="card text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3 }}
          >
            <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${c.bg} ${c.color}`}>
              {c.change}
            </div>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Yearly Trend Area Chart */}
      <ChartCard title="Year-over-Year Waste Trend" subtitle="Total waste generated, recycled, and landfilled (2019–2023)">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={yearlyTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              {[
                { id: 'waste',    color: '#16A34A' },
                { id: 'recycled', color: '#14B8A6' },
                { id: 'landfill', color: '#EF4444' },
              ].map((g) => (
                <linearGradient key={g.id} id={`grad-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={g.color} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={g.color} stopOpacity={0}    />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            <Area type="monotone" dataKey="totalWaste" name="Total Waste"  stroke="#16A34A" fill="url(#grad-waste)"    strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="recycled"   name="Recycled"     stroke="#14B8A6" fill="url(#grad-recycled)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="landfill"   name="Landfill"     stroke="#EF4444" fill="url(#grad-landfill)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Two column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waste by City */}
        <ChartCard title="Waste by City" subtitle="Total waste generated per city (2023)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cityWasteComparison} layout="vertical" margin={{ top: 0, right: 15, left: 10, bottom: 0 }} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(1)}K`} />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={72} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="waste" name="Total Waste (T)" fill="#16A34A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Disposal Methods */}
        <ChartCard title="Disposal Method Distribution" subtitle="How waste is being disposed (%)">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={240}>
              <PieChart>
                <Pie data={disposalMethodData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} paddingAngle={3} dataKey="value">
                  {disposalMethodData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {disposalMethodData.map((d) => (
                <div key={d.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-slate-600">{d.method}</span>
                  </div>
                  <span className="text-xs font-semibold text-textPrimary">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Waste by Type Bar */}
      <ChartCard title="Waste by Type" subtitle="Monthly generation by waste category (2023)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={wasteTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="organic" name="Organic" fill={CHART_PALETTE[0]} stackId="a" />
            <Bar dataKey="plastic" name="Plastic" fill={CHART_PALETTE[1]} stackId="a" />
            <Bar dataKey="paper"   name="Paper"   fill={CHART_PALETTE[2]} stackId="a" />
            <Bar dataKey="metal"   name="Metal"   fill={CHART_PALETTE[3]} stackId="a" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Scatter: Population Density vs Waste */}
      <ChartCard title="Population Density vs Waste Generated" subtitle="Correlation analysis — bubble size = relative waste volume">
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              type="number" dataKey="density" name="Pop. Density"
              tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
              label={{ value: 'Population Density (per km²)', position: 'insideBottom', offset: -3, fontSize: 11, fill: '#94A3B8' }}
            />
            <YAxis
              type="number" dataKey="waste" name="Waste Generated"
              tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
              label={{ value: 'Waste (T)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94A3B8' }}
            />
            <ZAxis type="number" dataKey="size" range={[60, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 text-sm">
                    <p className="font-semibold text-textPrimary">{d.city}</p>
                    <p className="text-slate-500">Density: {d.density?.toLocaleString()}/km²</p>
                    <p className="text-slate-500">Waste: {d.waste?.toLocaleString()} T</p>
                  </div>
                );
              }}
            />
            <Scatter data={densityVsWasteData} fill="#16A34A" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default Analytics;
