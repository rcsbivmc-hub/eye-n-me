
import React, { useState } from 'react';
import { Star, Trash2, Edit3, Check, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Idea, Category } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';

interface IdeaCardProps {
  idea: Idea;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Idea>) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onDelete, onToggleStar, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(idea.content);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    onUpdate(idea.id, { content: editContent });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`group relative bg-slate-800/40 border-l-4 ${CATEGORY_COLORS[idea.category].split(' ')[0]} rounded-xl p-4 transition-all duration-300 hover:bg-slate-800/60 shadow-lg hover:shadow-cyan-500/5`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${CATEGORY_COLORS[idea.source].split(' ').slice(1).join(' ')}`}>
          {idea.source === 'Voice' ? <CATEGORY_ICONS.Voice /> : <CATEGORY_ICONS.Typed />}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none min-h-[100px]"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-md text-xs font-semibold text-white transition-colors">
                  <Check size={14} /> Save
                </button>
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-xs font-semibold text-white transition-colors">
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className={`text-sm leading-relaxed text-slate-200 ${!isExpanded && 'line-clamp-3'}`}>
                {idea.content}
              </p>
              
              {idea.content.length > 200 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  {isExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
                </button>
              )}

              {idea.aiSummary && (
                <div className="mt-2 p-2 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-start gap-2">
                  <Sparkles size={12} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] italic text-slate-400 leading-tight">{idea.aiSummary}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[idea.category]}`}>
              {idea.category}
            </span>
            {idea.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-slate-900/80 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                #{tag}
              </span>
            ))}
            <span className="text-[10px] text-slate-500 ml-auto">
              {formatDate(idea.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onToggleStar(idea.id)}
            className={`p-1.5 rounded-md hover:bg-slate-700 transition-colors ${idea.starred ? 'text-amber-400' : 'text-slate-500'}`}
          >
            <Star size={16} fill={idea.starred ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-slate-500 hover:text-cyan-400"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => onDelete(idea.id)}
            className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-slate-500 hover:text-rose-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
