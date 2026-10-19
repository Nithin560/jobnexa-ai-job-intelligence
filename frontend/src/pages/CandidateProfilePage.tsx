import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { CandidateProfile } from '../types';
import { User, Briefcase, MapPin, Award, Check, Loader2, ArrowLeft } from 'lucide-react';
import { TopLoadingBar } from '../components/TopLoadingBar';

export const CandidateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [targetTitle, setTargetTitle] = useState('Backend Software Engineer');
  const [exp, setExp] = useState(0);
  const [workMode, setWorkMode] = useState('Hybrid');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>(['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS']);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Ensure that pressing browser Back button reliably returns directly to Home
  useEffect(() => {
    const handlePopState = () => {
      navigate('/', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  useEffect(() => {
    const fetchProf = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
        if (data.target_titles.length) setTargetTitle(data.target_titles[0]);
        if (typeof data.years_experience === 'number') setExp(data.years_experience);
        if (data.work_mode) setWorkMode(data.work_mode);
        if (data.skills.length) setSkills(data.skills);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProf();
  }, []);

  const handleAddSkill = () => {
    if (newSkill && newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (sName: string) => {
    setSkills(skills.filter((s) => s !== sName));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const parsedExp = Number(exp) || 0;
      await api.updateProfile({
        target_titles: [targetTitle],
        location_preferences: ['Bengaluru'],
        years_experience: parsedExp,
        work_mode: workMode,
        skills: skills,
      });

      // Update experience tier in session and local storage
      const newTier: 'fresher' | 'experienced' = parsedExp <= 1 ? 'fresher' : 'experienced';
      sessionStorage.setItem('user_experience_tier', newTier);
      localStorage.setItem('user_experience_tier', newTier);
      sessionStorage.setItem('years_experience', String(parsedExp));
      localStorage.setItem('years_experience', String(parsedExp));

      // Broadcast tier change event to active listeners
      window.dispatchEvent(new CustomEvent('userTierChanged', { detail: { tier: newTier, years: parsedExp } }));

      setSaved(true);
      // Give brief feedback then smoothly redirect to Home page
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 700);
    } catch (err) {
      console.error(err);
      alert('Error updating profile. Please check your connection and retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-12">
      <TopLoadingBar isLoading={loadingProfile || saving} />
      
      {/* Back to Home Button */}
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition group"
          title="Return to Home"
        >
          <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition shadow-2xs">
            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
          </div>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-14 h-14 bg-blue-600 text-white font-bold text-2xl rounded-2xl flex items-center justify-center">
            N
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidate Profile & Skill Preferences</h1>
            <p className="text-xs text-slate-500">Tune your candidate parameters to refine transparent match scores.</p>
          </div>
        </div>

        {saved && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center justify-between border border-emerald-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                Profile updated! Feed configured for {exp <= 1 ? 'Fresher (0 - 1 Years)' : 'Experienced (1+ Years)'} roles. Redirecting to Home...
              </span>
            </div>
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Target Job Title</label>
            <input
              type="text"
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 block">Years of Experience</label>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  exp <= 1 ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}>
                  {exp <= 1 ? '🎓 Fresher (0 - 1 Yrs)' : '💼 Experienced (1+ Yrs)'}
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="30"
                value={exp}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  setExp(isNaN(val) ? 0 : Math.max(0, val));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {exp <= 1 
                  ? '✨ Saving will set your account to Fresher jobs (0 - 1 years, 54 roles).'
                  : '✨ Saving will set your account to Experienced jobs (1+ years, 418 roles).'}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Work Mode Preference</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          {/* Skills Management */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">My Skills Dictionary</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add skill (e.g. Kubernetes, React, Python)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition"
              >
                Add Skill
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {skills.map((s) => (
                <span key={s} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <span>{s}</span>
                  <button onClick={() => handleRemoveSkill(s)} className="text-blue-400 hover:text-blue-900 font-bold">×</button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md shadow-blue-200 transition mt-4 flex items-center justify-center gap-2 text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile & Redirecting...</span>
              </>
            ) : (
              <span>Save Profile & Update Matching Engine</span>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
