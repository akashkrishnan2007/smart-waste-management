import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { MdCompareArrows, MdTrendingDown, MdTrendingUp, MdRemove } from 'react-icons/md';
import Input from '../common/Input';
import Button from '../common/Button';
import api from '../../services/api';

const ScenarioSimulator = ({ baseInputs, onSimulated }) => {
  const [scenario, setScenario] = useState({
    recycling_rate:       String(baseInputs.recyclingRate       ?? ''),
    municipal_efficiency: String(baseInputs.municipalEfficiency ?? ''),
    awareness:            String(baseInputs.awareness           ?? ''),
    cost:                 String(baseInputs.cost                ?? ''),
  });
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleChange = (e) => {
    setScenario((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        city:                baseInputs.city,
        wasteType:           baseInputs.wasteType,
        populationDensity:   Number(baseInputs.populationDensity),
        municipalEfficiency: Number(baseInputs.municipalEfficiency),
        recyclingRate:       Number(baseInputs.recyclingRate),
        cost:                Number(baseInputs.cost),
        awareness:           Number(baseInputs.awareness),
        landfillCapacity:    Number(baseInputs.landfillCapacity),
        year:                Number(baseInputs.year),
        scenario: {
          recycling_rate:       Number(scenario.recycling_rate),
          municipal_efficiency: Number(scenario.municipal_efficiency),
          awareness:            Number(scenario.awareness),
          cost:                 Number(scenario.cost),
        },
      };
      const res = await api.post('/prediction/simulate', payload);
      // api interceptor returns Flask body; inner data is at .data
      const simData = res?.data || res;
      setSimResult(simData);
      onSimulated?.(simData);
    } catch (err) {
      setError(
        err?.message ||
        (Array.isArray(err?.details) ? err.details[0] : null) ||
        'Simulation failed. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  const chartData = simResult
    ? [
        { name: 'Current',  waste: simResult.current_prediction  },
        { name: 'Scenario', waste: simResult.scenario_prediction },
      ]
    : [];

  const ImpactIcon =
    simResult?.impact_direction === 'decrease' ? MdTrendingDown :
    simResult?.impact_direction === 'increase' ? MdTrendingUp   : MdRemove;

  const impactColor =
    simResult?.impact_direction === 'decrease' ? 'text-green-600' :
    simResult?.impact_direction === 'increase' ? 'text-red-600'   : 'text-slate-500';

  return (
    <motion.div
      className="card border-2 border-blue-100"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <MdCompareArrows className="text-white text-xl" />
        </div>
        <div>
          <h3 className="font-semibold text-textPrimary">What-If Scenario Simulation</h3>
          <p className="text-xs text-slate-400">Modify parameters and compare with current prediction</p>
        </div>
      </div>

      {/* Scenario inputs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Input
          label="Recycling Rate (%)"
          name="recycling_rate"
          type="number"
          value={scenario.recycling_rate}
          onChange={handleChange}
          placeholder="e.g. 80"
        />
        <Input
          label="Municipal Efficiency (1–10)"
          name="municipal_efficiency"
          type="number"
          value={scenario.municipal_efficiency}
          onChange={handleChange}
          placeholder="e.g. 9"
        />
        <Input
          label="Awareness Campaigns"
          name="awareness"
          type="number"
          value={scenario.awareness}
          onChange={handleChange}
          placeholder="e.g. 18"
        />
        <Input
          label="Management Cost (₹/Ton)"
          name="cost"
          type="number"
          value={scenario.cost}
          onChange={handleChange}
          placeholder="e.g. 3200"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>
      )}

      <Button
        onClick={handleSimulate}
        loading={loading}
        icon={<MdCompareArrows />}
        fullWidth
        size="md"
      >
        {loading ? 'Simulating...' : 'Simulate Impact'}
      </Button>

      {/* Results */}
      <AnimatePresence>
        {simResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            {/* Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Current',    value: `${simResult.current_prediction?.toLocaleString()} T`,  color: 'text-slate-700' },
                { label: 'Scenario',   value: `${simResult.scenario_prediction?.toLocaleString()} T`, color: 'text-blue-600'  },
                { label: 'Difference', value: `${Math.abs(simResult.estimated_difference)?.toLocaleString()} T`, color: impactColor },
                { label: 'Change',     value: `${Math.abs(simResult.percentage_change)?.toFixed(2)}%`, color: impactColor },
              ].map((m) => (
                <div key={m.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-slate-400">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Impact message */}
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${
              simResult.impact_direction === 'decrease' ? 'bg-green-50' :
              simResult.impact_direction === 'increase' ? 'bg-red-50'   : 'bg-slate-50'
            }`}>
              <ImpactIcon className={`${impactColor} text-xl flex-shrink-0`} />
              <p className="text-xs text-slate-700">{simResult.message}</p>
            </div>

            {/* Comparison chart */}
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-2.5 text-xs">
                        <p className="font-semibold mb-1">{label}</p>
                        <p className="text-slate-600">{payload[0]?.value?.toLocaleString()} T/Day</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="waste" name="Predicted Waste (T/Day)" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-400 italic mt-2 text-center">
              {simResult.disclaimer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScenarioSimulator;
