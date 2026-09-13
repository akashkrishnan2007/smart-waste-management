import { MdRecycling } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MdRecycling className="text-primary-600 text-lg" />
          <span>
            <span className="font-semibold text-primary-600">SmartWaste</span> Analytics System
          </span>
          <span className="text-slate-300">|</span>
          <span>Final Year Project &copy; {new Date().getFullYear()}</span>
        </div>
        <p className="text-xs text-slate-400">
          Built with React.js &bull; Tailwind CSS &bull; Recharts
        </p>
      </div>
    </footer>
  );
};

export default Footer;
