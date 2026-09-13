import { motion } from 'framer-motion';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat } from 'react-icons/md';

/**
 * Dashboard StatCard component
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  trend,
  trendValue,
  delay = 0,
}) => {
  const getTrendIcon = () => {
    if (trend === 'up')   return <MdTrendingUp className="text-green-500" size={16} />;
    if (trend === 'down') return <MdTrendingDown className="text-red-500" size={16} />;
    return <MdTrendingFlat className="text-slate-400" size={16} />;
  };

  const getTrendColor = () => {
    if (trend === 'up')   return 'text-green-600 bg-green-50';
    if (trend === 'down') return 'text-red-500 bg-red-50';
    return 'text-slate-500 bg-slate-50';
  };

  return (
    <motion.div
      className="stat-card group cursor-default"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(22,163,74,0.15)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
        </div>
        <div className={`w-11 h-11 ${gradient} rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ml-3 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-white text-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <motion.p
          className="text-2xl font-bold text-textPrimary leading-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
        >
          {value}
        </motion.p>

        <div className="flex items-center gap-2">
          {trendValue && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-lg ${getTrendColor()}`}>
              {getTrendIcon()}
              {trendValue}
            </span>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
