import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MdLocationOn, MdSearch, MdMap, MdRefresh, MdMyLocation,
  MdFilterList, MdTrendingUp, MdTrendingDown, MdTrendingFlat,
} from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

// ── Fix Leaflet default icon paths broken by bundlers ────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Pressure config ───────────────────────────────────────────────────────────
const PC = {
  CRITICAL: { color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-300',    bar: 'bg-red-500',    dot: '#ef4444', ring: 'ring-red-400'    },
  HIGH:     { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300', bar: 'bg-orange-500', dot: '#f97316', ring: 'ring-orange-400' },
  MODERATE: { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300', bar: 'bg-yellow-500', dot: '#eab308', ring: 'ring-yellow-400' },
  LOW:      { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-300',  bar: 'bg-green-500',  dot: '#22c55e', ring: 'ring-green-400'  },
};

// ── Custom coloured Leaflet icon ──────────────────────────────────────────────
function makeIcon(level, isSelected = false) {
  const color = PC[level]?.dot || '#6b7280';
  const size  = isSelected ? 18 : 14;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${size * 0.67}" height="${size}">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>`;
  const url = 'data:image/svg+xml;base64,' + btoa(svg);
  return L.icon({
    iconUrl:      url,
    iconSize:     [size * 0.67, size],
    iconAnchor:   [size * 0.33, size],
    popupAnchor:  [0, -size],
  });
}

// ── Map controller: fit bounds or fly to marker ───────────────────────────────
function MapController({ landfills, flyTo }) {
  const map = useMap();

  useEffect(() => {
    if (!landfills.length) return;
    const bounds = L.latLngBounds(landfills.map(l => [l.latitude, l.longitude]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  }, [landfills, map]);

  useEffect(() => {
    if (!flyTo) return;
    map.flyTo([flyTo.latitude, flyTo.longitude], 12, { duration: 1.2 });
  }, [flyTo, map]);

  return null;
}

// ── Invalidate map size on mount (handles layout shifts) ─────────────────────
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
}

// ── Trend icon ────────────────────────────────────────────────────────────────
const TrendIcon = ({ trend }) => {
  if (trend === 'Increasing') return <MdTrendingUp className="text-red-500" size={14} />;
  if (trend === 'Decreasing') return <MdTrendingDown className="text-green-500" size={14} />;
  return <MdTrendingFlat className="text-slate-400" size={14} />;
};

// ── Pressure badge ────────────────────────────────────────────────────────────
const PressureBadge = ({ level }) => {
  const cfg = PC[level] || PC.LOW;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {level}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Landfills = () => {
  const [landfills, setLandfills]     = useState([]);
  const [summary, setSummary]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [selectedLf, setSelectedLf]   = useState(null);   // for card highlight
  const [flyTo, setFlyTo]             = useState(null);    // for map fly-to
  const [fitAll, setFitAll]           = useState(0);       // increment to re-fit
  const mapRef                        = useRef(null);
  const cardRefs                      = useRef({});
  const markerRefs                    = useRef({});

  const fetchLandfills = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/landfills');
      const body = res?.data || res || {};
      setLandfills(body.landfills || []);
      setSummary(body.summary || {});
    } catch {
      setError('Unable to load landfill data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLandfills(); }, [fetchLandfills]);

  // Filtered list (cards + map markers share same source)
  const filtered = landfills.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.name?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q);
    const matchLevel = filterLevel === 'All' || l.pressure_level === filterLevel;
    return matchSearch && matchLevel;
  });

  // View Map: fly to marker and highlight card
  const handleViewMap = (lf) => {
    setSelectedLf(lf.name);
    setFlyTo({ ...lf, _ts: Date.now() });
    // Scroll to map
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Open popup after fly
    setTimeout(() => {
      const marker = markerRefs.current[lf.name];
      if (marker) marker.openPopup();
    }, 1400);
  };

  // Marker click: highlight card
  const handleMarkerClick = (lf) => {
    setSelectedLf(lf.name);
    const cardEl = cardRefs.current[lf.name];
    if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading landfill data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Landfill Monitoring</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Track and analyze landfill pressure across monitored cities.
          </p>
        </div>
        <button
          onClick={fetchLandfills}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-2 rounded-xl"
        >
          <MdRefresh size={16} /> Refresh
        </button>
      </motion.div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={fetchLandfills}
            className="text-sm text-red-700 font-semibold underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary cards */}
      {!error && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Landfills', value: summary.total    ?? 0, bg: 'bg-primary-500' },
            { label: 'Critical',        value: summary.critical ?? 0, bg: 'bg-red-500'     },
            { label: 'High',            value: summary.high     ?? 0, bg: 'bg-orange-500'  },
            { label: 'Moderate',        value: summary.moderate ?? 0, bg: 'bg-yellow-500'  },
            { label: 'Low',             value: summary.low      ?? 0, bg: 'bg-green-500'   },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="card text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
            >
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <span className="text-white font-bold text-lg">{s.value}</span>
              </div>
              <p className="text-xs text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search landfill or city..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                filterLevel === lvl
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Landfill Cards */}
      {landfills.length === 0 && !error ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">No landfill records available.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">No landfills match your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((lf, i) => {
            const cfg = PC[lf.pressure_level] || PC.LOW;
            const isSelected = selectedLf === lf.name;
            return (
              <motion.div
                key={lf.name}
                ref={el => { cardRefs.current[lf.name] = el; }}
                className={`card hover:shadow-card-hover transition-all duration-300 group border-2 ${
                  isSelected ? `${cfg.border} ring-2 ${cfg.ring}` : 'border-transparent'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-textPrimary truncate group-hover:text-primary-700 transition-colors">
                      {lf.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                      <MdLocationOn size={13} />
                      {lf.city}
                    </div>
                  </div>
                  <PressureBadge level={lf.pressure_level} />
                </div>

                {/* Pressure bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Pressure Score</span>
                    <span className={`font-semibold ${cfg.color}`}>{lf.pressure_score} / 100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${cfg.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${lf.pressure_score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-sm font-bold text-textPrimary">
                      {lf.capacity_tons ? `${(lf.capacity_tons / 1000).toFixed(0)}K` : '—'}
                    </p>
                    <p className="text-[10px] text-slate-400">Capacity (T)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-textPrimary">
                      {lf.average_waste_per_day?.toFixed(0)} T
                    </p>
                    <p className="text-[10px] text-slate-400">Avg Waste/Day</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-textPrimary">
                      {lf.average_recycling_rate?.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-400">Avg Recycling</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <TrendIcon trend={lf.waste_trend} />
                    {lf.waste_trend}
                  </div>
                  <button
                    onClick={() => handleViewMap(lf)}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-medium"
                  >
                    <MdMap size={13} /> View Map
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Interactive Leaflet Map */}
      <motion.div
        ref={mapRef}
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-textPrimary">Interactive Landfill Map</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Geographic overview of monitored landfill locations and pressure levels.
              Markers show approximate city-level locations unless coordinates are verified.
            </p>
          </div>
          <button
            onClick={() => setFitAll(n => n + 1)}
            className="flex items-center gap-1.5 text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-xl font-medium whitespace-nowrap"
          >
            <MdMyLocation size={14} /> Fit All Landfills
          </button>
        </div>

        <div className="rounded-xl overflow-hidden relative" style={{ height: '460px' }}>
          {landfills.length > 0 && (
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapResizer />
              <MapController
                landfills={filtered.length > 0 ? filtered : landfills}
                flyTo={flyTo}
                key={fitAll}
              />
              {filtered.map(lf => (
                <Marker
                  key={lf.name}
                  position={[lf.latitude, lf.longitude]}
                  icon={makeIcon(lf.pressure_level, selectedLf === lf.name)}
                  ref={el => { if (el) markerRefs.current[lf.name] = el; }}
                  eventHandlers={{ click: () => handleMarkerClick(lf) }}
                >
                  <Popup minWidth={220}>
                    <div className="text-sm leading-relaxed">
                      <p className="font-bold text-base text-gray-800 mb-0.5">{lf.name}</p>
                      <p className="text-gray-500 text-xs mb-2">{lf.city}</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <span className="text-gray-500">Pressure Score</span>
                        <span className="font-semibold">{lf.pressure_score} / 100</span>
                        <span className="text-gray-500">Pressure Level</span>
                        <span className={`font-bold ${PC[lf.pressure_level]?.color}`}>{lf.pressure_level}</span>
                        <span className="text-gray-500">Capacity</span>
                        <span className="font-semibold">{lf.capacity_tons?.toLocaleString()} T</span>
                        <span className="text-gray-500">Avg Waste</span>
                        <span className="font-semibold">{lf.average_waste_per_day?.toFixed(0)} T/day</span>
                        <span className="text-gray-500">Avg Recycling</span>
                        <span className="font-semibold">{lf.average_recycling_rate?.toFixed(1)}%</span>
                        <span className="text-gray-500">Latest Year</span>
                        <span className="font-semibold">{lf.latest_year}</span>
                        <span className="text-gray-500">Waste Trend</span>
                        <span className="font-semibold">{lf.waste_trend}</span>
                        <span className="text-gray-500">Location</span>
                        <span className={`font-semibold ${lf.coordinates_verified ? 'text-green-600' : 'text-amber-600'}`}>
                          {lf.coordinates_verified ? 'Verified location' : 'Approx. city location'}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
          {filtered.length === 0 && landfills.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000] rounded-xl pointer-events-none">
              <p className="text-slate-500 text-sm font-medium bg-white px-4 py-2 rounded-lg shadow">
                No {filterLevel !== 'All' ? filterLevel : ''} landfills match the current filter.
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-medium text-slate-600 flex items-center gap-1">
            <MdFilterList size={14} /> Pressure:
          </span>
          {Object.entries(PC).map(([lvl, cfg]) => (
            <span key={lvl} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: cfg.dot }} />
              {lvl}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              Verified location
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Approx. city location
            </span>
          </span>
        </div>
      </motion.div>

      {/* Landfill Pressure Summary Table */}
      <motion.div
        className="card p-0 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-textPrimary">Landfill Pressure Summary</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pressure score is an analytical indicator (0–100) based on waste generation, recycling risk, and landfill dependency. It does not represent physical capacity utilisation.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Landfill', 'City', 'Capacity (T)', 'Avg Waste (T/day)', 'Avg Recycling', 'Pressure Score', 'Pressure Level', 'Trend'].map(h => (
                  <th key={h} className="table-header text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lf, i) => (
                <motion.tr
                  key={lf.name}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedLf === lf.name ? 'bg-primary-50' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleViewMap(lf)}
                >
                  <td className="table-cell font-medium text-textPrimary">{lf.name}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MdLocationOn size={13} className="text-primary-500" />
                      {lf.city}
                    </div>
                  </td>
                  <td className="table-cell">{lf.capacity_tons?.toLocaleString()}</td>
                  <td className="table-cell">{lf.average_waste_per_day?.toFixed(1)}</td>
                  <td className="table-cell">{lf.average_recycling_rate?.toFixed(1)}%</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${PC[lf.pressure_level]?.bar || 'bg-slate-400'}`}
                          style={{ width: `${lf.pressure_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{lf.pressure_score}</span>
                    </div>
                  </td>
                  <td className="table-cell"><PressureBadge level={lf.pressure_level} /></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <TrendIcon trend={lf.waste_trend} />
                      <span className="text-xs">{lf.waste_trend}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Landfills;
