
import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Calendar, Mail, Award, Edit3, BookOpen, Check, X, Save, Upload, MapPinned, GraduationCap, FileText } from 'lucide-react';
import { UserProfile } from '../types';
import { format } from "date-fns";




interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  darkMode: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile, darkMode }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  


  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`rounded-[2.5rem] border overflow-hidden shadow-sm transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        {/* Banner */}
        <div className="h-64 relative group">
          <img 
            src={profile.banner} 
            alt="Banner" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          <button 
            onClick={() => bannerInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition-all flex items-center gap-2 text-sm font-bold"
          >
            <Camera size={18} /> Change Banner
          </button>
          <input 
            type="file" 
            ref={bannerInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handleFileChange(e, 'banner')}
          />
        </div>

        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-20 mb-8">
            <div className="relative">
              <img 
                src={profile.avatar} 
                className={`w-40 h-40 rounded-[2.5rem] border-8 object-cover shadow-2xl transition-colors ${darkMode ? 'border-slate-800' : 'border-white'}`}
                alt="Avatar"
              />
              <button 
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg border-4 border-white hover:bg-indigo-700 transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'avatar')}
              />
            </div>
            <div className="flex-1">
              <h2 className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{profile.name}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <p className={`text-sm font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <GraduationCap size={16} className="text-indigo-500" /> {profile.major}
                </p>
                <p className={`text-sm font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <MapPin size={16} className="text-indigo-500" /> {profile.location}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowEditModal(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 group"
            >
              <Edit3 size={18} className="group-hover:rotate-12 transition-transform" /> Update Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  <FileText size={20} className="text-indigo-500" /> About Me
                </h3>
                <p className={`leading-relaxed font-medium text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {profile.bio}
                </p>
              </section>

              <section>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Achievements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-3xl flex items-center gap-5 border transition-colors ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-amber-50 border-amber-100'}`}>
                    <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg"><Award size={24} /></div>
                    <div>
                      <p className={`text-base font-bold ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>Consistency King</p>
                      <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-amber-700'}`}>20 Day Streak</p>
                    </div>
                  </div>
                  <div className={`p-5 rounded-3xl flex items-center gap-5 border transition-colors ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><BookOpen size={24} /></div>
                    <div>
                      <p className={`text-base font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-900'}`}>Study Machine</p>
                      <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-indigo-700'}`}>100 Tasks Done</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className={`p-6 rounded-[2rem] border transition-colors ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Personal Details</h4>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-500 shadow-sm'}`}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-tighter ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email</p>
                      <p className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-500 shadow-sm'}`}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-tighter ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Joined</p>
                      <p className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{profile?.joinDate || profile?.createdAt ? format(new Date(profile.joinDate || profile.createdAt), "MMMM d, yyyy") : "—"}</p>
                      {/* <p>{console.log(profile)}</p> */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Academic Rank</h4>
                <p className="text-4xl font-black">Elite 2%</p>
                <div className="mt-6 w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[98%] shadow-lg"></div>
                </div>
                <p className="mt-4 text-xs font-medium opacity-80 italic">You're doing better than 98% of users!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <UpdateProfileModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
          onSave={(updates) => {
            onUpdateProfile(updates);
            setShowEditModal(false);
          }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

interface UpdateProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updates: Partial<UserProfile>) => void;
  darkMode: boolean;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ profile, onClose, onSave, darkMode }) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    major: profile.major,
    location: profile.location,
    bio: profile.bio,
    joinDate: profile.joinDate
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden transition-colors ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
        <div className={`p-8 border-b flex items-center justify-between ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
          <div>
            <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Update Your Profile</h3>
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tell the community more about yourself</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-4 py-3.5 rounded-2xl border outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                placeholder="e.g. Alex Johnson"
                required
              />
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-black uppercase tracking-widest ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Major or Course</label>
              <input 
                type="text" 
                value={formData.major}
                onChange={(e) => setFormData({...formData, major: e.target.value})}
                className={`w-full px-4 py-3.5 rounded-2xl border outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                placeholder="e.g. Computer Science"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-black uppercase tracking-widest ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Location</label>
            <div className="relative">
              <MapPinned size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                placeholder="e.g. San Francisco, CA"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-black uppercase tracking-widest ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>About Me</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={4}
              className={`w-full px-4 py-3.5 rounded-2xl border outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold resize-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              placeholder="Share a bit about your study goals..."
            />
          </div>

          <div className={`pt-6 border-t flex gap-4 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <button 
              type="button" 
              onClick={onClose}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Discard Changes
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
