import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdRecycling, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: 'admin@smartwaste.in', password: 'admin123' });
  const [errors, setErrors]   = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    // Simulate auth
    await new Promise((r) => setTimeout(r, 1200));
    localStorage.setItem('token', 'demo-token-xyz');
    localStorage.setItem('user', JSON.stringify({ name: 'Admin User', email: form.email, role: 'Administrator' }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-primary-50 p-6">
      {/* Centered form container */}
      <motion.div
        className="w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 gradient-green rounded-xl flex items-center justify-center">
              <MdRecycling className="text-white text-2xl" />
            </div>
            <div>
              <p className="font-bold text-xl text-primary-700">SmartWaste</p>
              <p className="text-slate-500 text-xs">Analytics System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-textPrimary">Welcome back 👋</h2>
            <p className="text-slate-500 mt-1.5">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@smartwaste.in"
              icon={<MdEmail />}
              error={errors.email}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-textPrimary">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-600 rounded" />
                Remember me
              </label>
              <button type="button" className="text-sm text-primary-600 font-medium hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-xs font-semibold text-primary-700 mb-1">Demo Credentials</p>
            <p className="text-xs text-slate-500">Email: admin@smartwaste.in</p>
            <p className="text-xs text-slate-500">Password: admin123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
