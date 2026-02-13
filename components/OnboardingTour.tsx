
import React, { useState } from 'react';
import { 
  Zap, 
  Mic, 
  Database, 
  Search, 
  ChevronRight, 
  X, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    title: "Welcome to IdeaFlow",
    description: "The ultimate command center for your creative sparks. Let's take a quick look at how you can master your thoughts.",
    icon: <Zap className="text-amber-400" size={32} />,
    highlight: null
  },
  {
    title: "Instant Capture",
    description: "Use Voice or Typed mode to instantly record ideas. Our AI even enhances them with summaries and tags automatically.",
    icon: <Mic className="text-violet-400" size={32} />,
    highlight: "capture"
  },
  {
    title: "Knowledge Bank",
    description: "Every thought is indexed, searchable, and organized. Never lose a 'million-dollar idea' again.",
    icon: <Database className="text-cyan-400" size={32} />,
    highlight: "bank"
  },
  {
    title: "Intelligent Scraper",
    description: "Power through research with our Deep Scrape tool. It scours the web to ground your ideas in real-world data.",
    icon: <Search className="text-rose-400" size={32} />,
    highlight: "search"
  },
  {
    title: "Ready to Start?",
    description: "You're all set! Go ahead and capture your first spark. The future of your creative process starts now.",
    icon: <CheckCircle2 className="text-emerald-400" size={32} />,
    highlight: null
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500" />

      {/* Tour Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-rose-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
        
        <div className="p-10 space-y-8">
          <header className="flex justify-between items-start">
            <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 shadow-xl ring-1 ring-white/5">
              {step.icon}
            </div>
            <button 
              onClick={onComplete}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </header>

          <div className="space-y-3">
            <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              {step.title} <Sparkles size={20} className="text-cyan-400 animate-pulse" />
            </h2>
            <p className="text-slate-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          <footer className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {TOUR_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-cyan-500' : 'w-2 bg-slate-800'}`}
                />
              ))}
            </div>

            <button 
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-cyan-500/10"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next Step'} <ChevronRight size={18} />
            </button>
          </footer>
        </div>

        {/* Highlight hint indicator (visual only in this modal context) */}
        {step.highlight && (
          <div className="bg-slate-950/80 px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest text-cyan-500 border-t border-slate-800 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            Check the sidebar for "{step.highlight}"
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingTour;
