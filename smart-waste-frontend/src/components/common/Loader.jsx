import { motion } from 'framer-motion';

/**
 * Full-page loader
 */
export const PageLoader = () => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm text-slate-500 font-medium">Loading...</p>
    </div>
  </div>
);

/**
 * Inline spinner
 */
export const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  const colors = {
    primary: 'border-primary-200 border-t-primary-600',
    white:   'border-white/30 border-t-white',
    gray:    'border-slate-200 border-t-slate-500',
  };
  return (
    <motion.div
      className={`rounded-full border-2 ${sizes[size]} ${colors[color]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );
};

/**
 * Skeleton card loader
 */
export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-card p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="w-10 h-10 bg-slate-200 rounded-xl" />
    </div>
    <div className="h-7 bg-slate-200 rounded w-1/2 mb-2" />
    <div className="h-3 bg-slate-100 rounded w-2/3" />
  </div>
);

/**
 * Skeleton table row
 */
export const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3.5 border-b border-slate-100">
        <div className="h-4 bg-slate-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

/**
 * Default export — generic Loader
 */
const Loader = ({ fullPage = false }) => {
  if (fullPage) return <PageLoader />;
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner size="lg" />
    </div>
  );
};

export default Loader;
