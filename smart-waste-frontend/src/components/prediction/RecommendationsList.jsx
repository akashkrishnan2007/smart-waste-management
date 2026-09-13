import { motion } from 'framer-motion';
import { MdLightbulb } from 'react-icons/md';

const PRIORITY_CONFIG = {
  HIGH:   { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500'    },
  MEDIUM: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  LOW:    { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',  dot: 'bg-blue-500'   },
};

const RecommendationCard = ({ rec, index }) => {
  const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.LOW;
  return (
    <motion.div
      className={`${cfg.bg} border ${cfg.border} rounded-xl p-3`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0 mt-0.5`} />
          <p className="text-sm font-semibold text-textPrimary">{rec.title}</p>
        </div>
        <span className={`badge ${cfg.badge} text-[10px] flex-shrink-0`}>{rec.priority}</span>
      </div>
      <p className="text-xs text-slate-600 ml-4 mb-1.5">{rec.message}</p>
      <div className="ml-4 flex items-center gap-1.5">
        <MdLightbulb className="text-amber-500 text-xs flex-shrink-0" />
        <p className="text-[10px] text-slate-500 italic">{rec.expected_benefit}</p>
      </div>
    </motion.div>
  );
};

const RecommendationsList = ({ recommendations }) => {
  if (!recommendations?.length) return null;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 gradient-green rounded-xl flex items-center justify-center">
          <MdLightbulb className="text-white text-xl" />
        </div>
        <div>
          <h3 className="font-semibold text-textPrimary">Smart Recommendations</h3>
          <p className="text-xs text-slate-400">Explainable, data-driven action items</p>
        </div>
        <span className="badge bg-slate-100 text-slate-600 ml-auto">{recommendations.length}</span>
      </div>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={i} rec={rec} index={i} />
        ))}
      </div>
    </motion.div>
  );
};

export default RecommendationsList;
