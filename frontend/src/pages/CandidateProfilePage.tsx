import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CandidateProfile } from '../types';
import { User, Briefcase, MapPin, Award, Check } from 'lucide-react';

export const CandidateProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [targetTitle, setTargetTitle] = useState('Backend Software Engineer');
  const [exp, setExp] = useState(2);
  const [workMode, setWorkMode] = useState('Hybrid');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>(['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS']);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProf = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
        if (data.target_titles.length) setTargetTitle(data.target_titles[0]);
        if (data.years_experience) setExp(data.years_experience);
        if (data.work_mode) setWorkMode(data.work_mode);
        if (data.skills.length) setSkills(data.skills);
      } catch (err) {
        console.error(err);
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
      await api.updateProfile({
        target_titles: [targetTitle],
        location_preferences: ['Bengaluru'],
        years_experience: exp,
        work_mode: workMode,
        skills: skills,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error updating profile.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
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
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Target Job Title</label>
            <input
              type="text"
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Years of Experience</label>
              <input
                type="number"
                value={exp}
                onChange={(e) => setExp(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Work Mode Preference</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600"
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
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900"
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
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-200 transition mt-4"
          >
            Save Profile & Update Matching Engine
          </button>
        </div>

      </div>

    </div>
  );
};
