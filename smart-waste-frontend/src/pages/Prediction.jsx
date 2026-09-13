import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAutoGraph, MdHistory, MdCheckCircle, MdError } from 'react-icons/md';
import Button from '../components/common/Button';
import { Select } from '../components/common/Input';
import Input from '../components/common/Input';
import RiskAnalysis from '../components/prediction/RiskAnalysis';
import RecommendationsList from '../components/prediction/RecommendationsList';
import ScenarioSimulator from '../components/prediction/ScenarioSimulator';
import { CITIES, WASTE_TYPES, PREDICTION_YEARS } from '../utils/constants';
import api from '../services/api';

const INITIAL_FORM = {
  city: '', wasteType: '', populationDensity: '', municipalEfficiency: '',
  recyclingRate: '', cost: '', awareness: '', landfillCapacity: '', year: '',
};

const Toast = ({ message, type, onClose }) => (
  <motion.div
    className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}
    initial={{ opacity: 0, x: 60 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 60 }}
  >
    {type === 'error' ? <MdError className="text-lg shrink-0" /> : <MdCheckCircle className="text-lg shrink-0" />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
  </motion.div>
);

const Prediction = () => {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast]     = useState(null);
  const [predTime, setPredTime] = useState(null);

  useEffect(() => { fetchHistory(); }, []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/prediction/history');
      // api interceptor returns Flask body; inner data is at .data
      setHistory(res?.data || []);
    } catch { /* non-critical */ }
  };

  const validate = () => {
    const e = {};
    if (!form.city)               e.city               = 'Required';
    if (!form.wasteType)          e.wasteType          = 'Required';
    if (!form.populationDensity)  e.populationDensity  = 'Required';
    if (!form.municipalEfficiency) e.municipalEfficiency = 'Required';
    if (!form.recyclingRate)      e.recyclingRate      = 'Required';
    if (!form.cost)               e.cost               = 'Required';
    if (!form.awareness)          e.awareness          = 'Required';
    if (!form.landfillCapacity)   e.landfillCapacity   = 'Required';
    if (!form.year)               e.year               = 'Required';
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const startTime = Date.now();

    try {
      const payload = {
        city:                form.city,
        wasteType:           form.wasteType,
        populationDensity:   Number(form.populationDensity),
        municipalEfficiency: Number(form.municipalEfficiency),
        recyclingRate:       Number(form.recyclingRate),
        cost:                Number(form.cost),
        awareness:           Number(form.awareness),
        landfillCapacity:    Number(form.landfillCapacity),
        year:                Number(form.year),
      };

      const res = await api.post('/predict', payload);
      // api interceptor returns Flask body; inner prediction data is at .data
      const data = res?.data || res;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      setPredTime(elapsed);
      setResult({ ...data, ...payload, createdAt: new Date().toISOString().split('T')[0] });

      setHistory((prev) => [{
        _id: Date.now(), ...payload,
        predictedWaste: data.predictedWaste,
        createdAt: new Date().toISOString(),
      }, ...prev.slice(0, 49)]);

      showToast('Prediction generated successfully!', 'success');
    } catch (err) {
      const msg = err?.message || err?.details?.[0] || 'Prediction failed. Please check your inputs.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-textPrimary">Waste Prediction</h1>
        <p className="text-slate-500 text-sm mt-0.5">ML-powered forecasting with risk analysis and scenario simulation</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Prediction Form */}
        <motion.div
          className="card lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 gradient-green rounded-xl flex items-center justify-center">
              <MdAutoGraph className="text-white text-xl" />
            </div>
            <div>
              <h2 className="font-semibold text-textPrimary">Predict Waste</h2>
              <p className="text-xs text-slate-400">Fill in all 9 parameters below</p>
            </div>
          </div>

          <form onSubmit={handlePredict} className="space-y-3">
            <Select label="City" name="city" value={form.city} onChange={handleChange}
              options={CITIES} placeholder="Select city" error={errors.city} required />
            <Select label="Waste Type" name="wasteType" value={form.wasteType} onChange={handleChange}
              options={WASTE_TYPES} placeholder="Select waste type" error={errors.wasteType} required />
            <Input label="Population Density (per km²)" name="populationDensity" type="number"
              value={form.populationDensity} onChange={handleChange} placeholder="e.g. 11191"
              error={errors.populationDensity} required />
            <Input label="Municipal Efficiency Score (1–10)" name="municipalEfficiency" type="number"
              value={form.municipalEfficiency} onChange={handleChange} placeholder="e.g. 9"
              error={errors.municipalEfficiency} required />
            <Input label="Recycling Rate (%)" name="recyclingRate" type="number"
              value={form.recyclingRate} onChange={handleChange} placeholder="e.g. 68"
              error={errors.recyclingRate} required />
            <Input label="Cost of Waste Management (₹/Ton)" name="cost" type="number"
              value={form.cost} onChange={handleChange} placeholder="e.g. 3056"
              error={errors.cost} required />
            <Input label="Awareness Campaigns Count" name="awareness" type="number"
              value={form.awareness} onChange={handleChange} placeholder="e.g. 14"
              error={errors.awareness} required />
            <Input label="Landfill Capacity (Tons)" name="landfillCapacity" type="number"
              value={form.landfillCapacity} onChange={handleChange} placeholder="e.g. 45575"
              error={errors.landfillCapacity} required />
            <Select label="Prediction Year" name="year" value={form.year} onChange={handleChange}
              options={PREDICTION_YEARS} placeholder="Select year" error={errors.year} required />

            <Button type="submit" fullWidth loading={loading} size="lg" icon={<MdAutoGraph />}>
              {loading ? 'Predicting...' : 'Run Prediction'}
            </Button>
          </form>
        </motion.div>

        {/* Right Panel */}
        <div className="lg:col-span-3 space-y-5">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                className="card border-2 border-primary-100"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MdCheckCircle className="text-primary-600 text-xl" />
                      <h3 className="font-semibold text-textPrimary">AI Waste Forecast</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      {result.city} • {result.wasteType} • {result.year}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="badge bg-slate-100 text-slate-600 text-xs">Model: Random Forest</span>
                    <span className="badge bg-primary-100 text-primary-700 text-xs">Waste Generation Forecast</span>
                    {predTime && <span className="text-xs text-slate-400">⏱ {predTime}s</span>}
                  </div>
                </div>

                {/* Main metric */}
                <div className="bg-gradient-to-br from-primary-50 to-teal-50 rounded-2xl p-5 mb-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">Predicted Waste Generated</p>
                  <p className="text-4xl font-bold text-primary-700">
                    {result.predictedWaste?.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Tons / Day</p>
                </div>

                {/* Input summary */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Population Density', value: `${Number(result.populationDensity)?.toLocaleString()}/km²`, color: 'text-purple-600' },
                    { label: 'Municipal Efficiency', value: `${result.municipalEfficiency}/10`, color: 'text-orange-600' },
                    { label: 'Recycling Rate', value: `${result.recyclingRate}%`, color: 'text-green-600' },
                  ].map((m) => (
                    <div key={m.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                      <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="card border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-14"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <MdAutoGraph className="text-slate-300 text-5xl mb-3" />
                <p className="text-slate-400 font-medium">No prediction yet</p>
                <p className="text-slate-300 text-sm mt-1">Fill the form and click "Run Prediction"</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Risk Analysis */}
          {result?.riskAnalysis && <RiskAnalysis riskAnalysis={result.riskAnalysis} />}

          {/* Recommendations */}
          {result?.recommendations?.length > 0 && (
            <RecommendationsList recommendations={result.recommendations} />
          )}

          {/* Scenario Simulation */}
          {result && (
            <ScenarioSimulator
              baseInputs={result}
              onSimulated={() => {}}
            />
          )}
        </div>
      </div>

      {/* Prediction History */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <MdHistory className="text-slate-500 text-xl" />
          <h3 className="font-semibold text-textPrimary">Prediction History</h3>
          <span className="badge bg-slate-100 text-slate-600 ml-1">{history.length}</span>
        </div>
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No predictions yet. Run your first prediction above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  {['City', 'Waste Type', 'Pop. Density', 'Efficiency', 'Year', 'Predicted (T)', 'Date'].map((h) => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <motion.tr
                    key={row._id || i}
                    className="hover:bg-slate-50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td className="table-cell font-medium">{row.city}</td>
                    <td className="table-cell">
                      <span className="badge bg-green-100 text-green-800">{row.wasteType}</span>
                    </td>
                    <td className="table-cell text-slate-500">{Number(row.populationDensity)?.toLocaleString()}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${row.municipalEfficiency >= 7 ? 'bg-green-500' : row.municipalEfficiency >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        {row.municipalEfficiency}/10
                      </div>
                    </td>
                    <td className="table-cell">{row.year}</td>
                    <td className="table-cell font-bold text-primary-600">{Number(row.predictedWaste)?.toLocaleString()}</td>
                    <td className="table-cell text-slate-400 text-xs">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Prediction;
