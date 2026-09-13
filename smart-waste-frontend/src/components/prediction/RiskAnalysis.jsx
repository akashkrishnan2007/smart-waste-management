import { motion } from 'framer-motion';
import { MdWarning, MdCheckCircle, MdError, MdInfo } from 'react-icons/md';

const LEVEL_CONFIG = {
  LOW:      { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200', bar: 'bg-green-500',  icon: MdCheckCircle },
  MODERATE: { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200',bar: 'bg-yellow-500', icon: MdWarning     },
  HIGH:     { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200',bar: 'bg-orange-500', icon: MdWarning     },
  CRITICAL: { color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',   bar: 'bg-red-500',    icon: MdError       },
  UNKNOWN:  { color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200', bar: 'bg-slate-400',  icon: MdInfo        },
};

const RiskAnalysis = ({ riskAnalysis }) => {
  if (!riskAnalysis) return null;

  const { risk_score, risk_level, risk_factors, component_scores } = riskAnalysis;
  const cfg = LEVEL_CONFIG[risk_level] || LEVEL_CONFIG.UNKNOWN;
  const Icon = cfg.icon;

  const components = [
    { label: 'Waste Volume',   value: component_scores?.waste_volume_pressure },
    { label: 'Recycling Risk', value: component_scores?.recycling_risk        },
    { label: 'Efficiency',     value: component_scores?.efficiency_risk       },
    { label: 'Landfill',       value: component_scores?.landfill_pressure     },
    { label: 'Waste Type',     value: component_scores?.waste_type_risk       },
  ];

  return (
    <motion.div
      className={`card border ${cfg.border}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`${cfg.color} text-xl`} />
        </div>
        <div>
          <h3 className="font-semibold text-textPrimary">Waste Pressure Analysis</h3>
          <p className="text-xs text-slate-400">Rule-based analytical risk scoring</p>
        </div>
      </div>

      {/* Score + Level */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Risk Score</span>
            <span className={`font-bold ${cfg.color}`}>{risk_score} / 100</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${cfg.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${risk_score}%` }}
              transition={{ duration: 0.9, delay: 0.2 }}
            />
          </div>
        </div>
        <span className={`badge ${cfg.bg} ${cfg.color} border ${cfg.border} font-bold px-3 py-1.5 text-sm`}>
          {risk_level}
        </span>
      </div>

      {/* Component breakdown */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {components.map((c) => (
          <div key={c.label} className="text-center">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
              <div className={`h-full ${cfg.bar} rounded-full`} style={{ width: `${c.value ?? 0}%` }} />
            </div>
            <p className="text-[9px] text-slate-400 leading-tight">{c.label}</p>
            <p className="text-[10px] font-semibold text-textPrimary">{c.value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Risk factors */}
      <div className={`${cfg.bg} rounded-xl p-3`}>
        <p className="text-xs font-semibold text-slate-600 mb-2">Risk Factors</p>
        <ul className="space-y-1">
          {risk_factors.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${cfg.bar} flex-shrink-0`} />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default RiskAnalysis;
