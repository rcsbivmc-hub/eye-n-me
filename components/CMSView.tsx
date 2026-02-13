
import React, { useState, useEffect } from 'react';
import { Layout, Plus, Trash2, Edit3, Image as ImageIcon, Save, CheckCircle2 } from 'lucide-react';
import { CMSAnnouncement } from '../types';
import { STORAGE_KEYS } from '../constants';

const CMSView: React.FC = () => {
  const [content, setContent] = useState<CMSAnnouncement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CMSAnnouncement>>({
    title: '', text: '', isActive: true
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CMS);
    if (saved) setContent(JSON.parse(saved));
  }, []);

  const saveContent = (updated: CMSAnnouncement[]) => {
    setContent(updated);
    localStorage.setItem(STORAGE_KEYS.CMS, JSON.stringify(updated));
  };

  const handleAdd = () => {
    const newItem: CMSAnnouncement = {
      id: Date.now().toString(),
      title: formData.title || 'New Announcement',
      text: formData.text || '',
      isActive: formData.isActive || true,
      createdAt: new Date().toISOString()
    };
    saveContent([newItem, ...content]);
    setIsEditing(false);
    setFormData({ title: '', text: '', isActive: true });
  };

  const handleDelete = (id: string) => {
    saveContent(content.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">App Content Manager</h2>
          <p className="text-slate-500 text-sm">Control what users see on the dashboard.</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-bold transition-all"
        >
          <Plus size={18} /> New Entry
        </button>
      </header>

      {isEditing && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Headline</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Message Body</label>
            <textarea 
              value={formData.text} 
              onChange={e => setFormData({...formData, text: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500 min-h-[100px]"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 bg-emerald-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Save size={18}/> Deploy</button>
            <button onClick={() => setIsEditing(false)} className="px-6 bg-slate-800 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.map(item => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-200">{item.title}</h4>
                <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-slate-800 rounded-lg text-rose-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2">{item.text}</p>
            <div className="mt-auto pt-3 border-t border-slate-800 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
              <span className="text-[10px] font-bold uppercase text-slate-500">{item.isActive ? 'Active' : 'Draft'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CMSView;
