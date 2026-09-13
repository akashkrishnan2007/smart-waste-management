import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack } from 'react-icons/md';
import Button from '../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated 404 */}
        <motion.div
          className="text-[120px] font-bold text-primary-100 leading-none select-none"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          404
        </motion.div>

        <div className="text-6xl mb-4">🌿</div>

        <h1 className="text-2xl font-bold text-textPrimary mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-8">
          Looks like this page has been recycled! The route you're looking for doesn't exist.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button
            variant="outline"
            icon={<MdArrowBack />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            icon={<MdHome />}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
