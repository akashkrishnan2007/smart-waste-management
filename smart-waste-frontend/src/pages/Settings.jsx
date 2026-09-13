import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdPalette, MdNotifications, MdAccountCircle,
  MdSecurity, MdSave, MdLock, MdDarkMode, MdLightMode,
  MdLanguage, MdStorage,
} from 'react-icons/md';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import useLocalStorage from '../hooks/useLocalStorage';

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
    <div>
      <p className="text-sm font-medium text-textPrimary">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-primary-600' : 'bg-slate-200'}`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}
      />
    </button>
  </div>
);

const SectionCard = ({ icon: Icon, title, children }) => (
  <motion.div
    className="card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
        <Icon className="text-primary-600 text-xl" />
      </div>
      <h3 className="font-semibold text-textPrimary">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const Settings = () => {
  const [darkMode, setDarkMode]   = useLocalStorage('darkMode', false);
  const [notifs, setNotifs]       = useState({
    emailAlerts: true, smsAlerts: false, pushNotifs: true,
    weeklyReport: true, landfillAlerts: true,
  });
  const [account, setAccount]     = useState({
    language: 'en', timezone: 'IST', dataRefresh: '30',
  });
  const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' });
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const setNotif = (key) => (val) => setNotifs((p) => ({ ...p, [key]: val }));

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <motion.div
        className="flex items-center justify-between flex-wrap gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Customize your dashboard experience</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <motion.span
              className="text-sm text-green-600 font-medium flex items-center gap-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              ✓ Settings saved
            </motion.span>
          )}
          <Button loading={saving} icon={<MdSave />} onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Theme */}
        <SectionCard icon={MdPalette} title="Appearance">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setDarkMode(false)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${!darkMode ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <MdLightMode className={`text-2xl ${!darkMode ? 'text-primary-600' : 'text-slate-400'}`} />
              <span className={`text-sm font-medium ${!darkMode ? 'text-primary-700' : 'text-slate-500'}`}>Light Mode</span>
            </button>
            <button
              onClick={() => setDarkMode(true)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${darkMode ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <MdDarkMode className={`text-2xl ${darkMode ? 'text-primary-600' : 'text-slate-400'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-primary-700' : 'text-slate-500'}`}>Dark Mode</span>
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-textPrimary mb-3">Accent Color</p>
            <div className="flex gap-3">
              {[
                { color: '#16A34A', name: 'Green'  },
                { color: '#0F766E', name: 'Teal'   },
                { color: '#1D4ED8', name: 'Blue'   },
                { color: '#7C3AED', name: 'Purple' },
                { color: '#EA580C', name: 'Orange' },
              ].map((c) => (
                <button
                  key={c.color}
                  title={c.name}
                  className="w-8 h-8 rounded-full border-2 border-white shadow transition-transform hover:scale-110"
                  style={{ background: c.color }}
                />
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={MdNotifications} title="Notifications">
          <Toggle checked={notifs.emailAlerts}    onChange={setNotif('emailAlerts')}    label="Email Alerts"       description="Receive alerts via email"                    />
          <Toggle checked={notifs.smsAlerts}      onChange={setNotif('smsAlerts')}      label="SMS Alerts"         description="Receive SMS for critical events"              />
          <Toggle checked={notifs.pushNotifs}     onChange={setNotif('pushNotifs')}     label="Push Notifications" description="Browser push notifications"                   />
          <Toggle checked={notifs.weeklyReport}   onChange={setNotif('weeklyReport')}   label="Weekly Summary"     description="Weekly waste analytics report in your inbox"  />
          <Toggle checked={notifs.landfillAlerts} onChange={setNotif('landfillAlerts')} label="Landfill Alerts"    description="Alert when capacity exceeds 80%"              />
        </SectionCard>

        {/* Account */}
        <SectionCard icon={MdAccountCircle} title="Account Settings">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-textPrimary block mb-2">Language</label>
              <select
                value={account.language}
                onChange={(e) => setAccount((p) => ({ ...p, language: e.target.value }))}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-textPrimary block mb-2">Timezone</label>
              <select
                value={account.timezone}
                onChange={(e) => setAccount((p) => ({ ...p, timezone: e.target.value }))}
                className="input-field"
              >
                <option value="IST">IST — India Standard Time (UTC+5:30)</option>
                <option value="UTC">UTC — Coordinated Universal Time</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-textPrimary block mb-2">
                Data Auto-Refresh (seconds)
              </label>
              <select
                value={account.dataRefresh}
                onChange={(e) => setAccount((p) => ({ ...p, dataRefresh: e.target.value }))}
                className="input-field"
              >
                <option value="15">Every 15 seconds</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 1 minute</option>
                <option value="300">Every 5 minutes</option>
                <option value="0">Manual only</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
              <MdStorage className="text-lg text-slate-400" />
              <span>Local storage used: <b>4.2 KB</b> / 5 MB</span>
            </div>
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard icon={MdSecurity} title="Security">
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              placeholder="Enter current password"
              icon={<MdLock />}
            />
            <Input
              label="New Password"
              type="password"
              value={passwords.newPwd}
              onChange={(e) => setPasswords((p) => ({ ...p, newPwd: e.target.value }))}
              placeholder="Enter new password"
              icon={<MdLock />}
              helperText="Minimum 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Confirm new password"
              icon={<MdLock />}
            />
            <Button variant="outline" fullWidth>Change Password</Button>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-sm font-medium text-textPrimary mb-3">Two-Factor Authentication</p>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-textPrimary">Authenticator App</p>
                  <p className="text-xs text-slate-400">Use Google Authenticator or Authy</p>
                </div>
                <span className="badge bg-yellow-100 text-yellow-700">Not Enabled</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Danger Zone */}
      <motion.div
        className="card border border-red-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-textPrimary">Clear All Local Data</p>
            <p className="text-xs text-slate-400">This will reset all preferences and cached data</p>
          </div>
          <Button variant="danger" size="sm">Clear Data</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
