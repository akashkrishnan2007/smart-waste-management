import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdEdit, MdEmail, MdPhone, MdBadge, MdLocationCity,
  MdCalendarToday, MdVerified, MdCameraAlt,
} from 'react-icons/md';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';

const initialProfile = {
  name:       'Admin User',
  email:      'admin@smartwaste.in',
  phone:      '+91 98765 43210',
  role:       'Administrator',
  department: 'Waste Management Division',
  city:       'Mumbai',
  joinDate:   '2022-08-15',
  bio:        'Data Science engineer specializing in urban waste management analytics and prediction systems.',
};

const Profile = () => {
  const [profile, setProfile]     = useState(initialProfile);
  const [showEdit, setShowEdit]   = useState(false);
  const [editForm, setEditForm]   = useState(initialProfile);
  const [saving, setSaving]       = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setProfile(editForm);
    setSaving(false);
    setShowEdit(false);
  };

  const stats = [
    { label: 'Predictions Run',    value: '47'   },
    { label: 'Reports Generated',  value: '23'   },
    { label: 'Cities Managed',     value: '15'   },
    { label: 'Data Records',       value: '1,240' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-textPrimary">My Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your personal information</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <motion.div
          className="card flex flex-col items-center text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Avatar */}
          <div className="relative mb-5">
            <div className="w-28 h-28 gradient-green rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg">
              {profile.name.charAt(0)}
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-primary-600 transition-colors border border-slate-100">
              <MdCameraAlt size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-xl font-bold text-textPrimary">{profile.name}</h2>
            <MdVerified className="text-primary-600 text-lg" />
          </div>

          <span className="badge bg-primary-100 text-primary-700 mb-3">{profile.role}</span>

          <p className="text-slate-500 text-sm px-4">{profile.bio}</p>

          <div className="w-full mt-5 pt-5 border-t border-slate-100 space-y-3">
            {[
              { icon: MdEmail,        label: profile.email,      },
              { icon: MdPhone,        label: profile.phone,      },
              { icon: MdBadge,        label: profile.department, },
              { icon: MdLocationCity, label: profile.city,       },
              { icon: MdCalendarToday,label: `Joined ${profile.joinDate}` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-slate-500">
                <Icon className="text-primary-500 text-base flex-shrink-0" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>

          <Button
            className="mt-5 w-full"
            variant="outline"
            icon={<MdEdit />}
            onClick={() => { setEditForm(profile); setShowEdit(true); }}
          >
            Edit Profile
          </Button>
        </motion.div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="card text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ y: -3 }}
              >
                <p className="text-2xl font-bold text-primary-600">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Info Cards */}
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="font-semibold text-textPrimary mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name',   value: profile.name       },
                { label: 'Email',       value: profile.email      },
                { label: 'Phone',       value: profile.phone      },
                { label: 'Role',        value: profile.role       },
                { label: 'Department',  value: profile.department },
                { label: 'City',        value: profile.city       },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className="text-sm font-medium text-textPrimary">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="font-semibold text-textPrimary mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Ran prediction for Mumbai Organic Waste', time: '2 hours ago',  icon: '🤖', color: 'bg-blue-50 text-blue-600'    },
                { action: 'Generated Q4 2023 Annual Report',         time: '5 hours ago',  icon: '📄', color: 'bg-purple-50 text-purple-600' },
                { action: 'Updated 15 waste records for Delhi',      time: '1 day ago',    icon: '📝', color: 'bg-yellow-50 text-yellow-600' },
                { action: 'Analyzed Bangalore recycling trends',     time: '2 days ago',   icon: '📊', color: 'bg-green-50 text-green-600'   },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center text-base flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-textPrimary font-medium truncate">{item.action}</p>
                    <p className="text-xs text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
          <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
          <Input label="Department" value={editForm.department} onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))} />
          <Input label="City" value={editForm.city} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-textPrimary">Bio</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
