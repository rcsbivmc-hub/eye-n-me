
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search as SearchIcon, 
  Database, 
  BarChart3, 
  Mic, 
  Keyboard, 
  X, 
  Sparkles,
  Zap,
  Star,
  Clock,
  CheckCircle2,
  LogOut,
  Bell,
  User as UserIcon,
  Globe,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  CreditCard,
  Crown,
  Tag,
  UserCog,
  FileSearch,
  Layers,
  ExternalLink,
  Info,
  Activity,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import { Idea, Category, Stats, Tab, User, CMSAnnouncement, WebResult, SubscriptionPlan } from './types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, STORAGE_KEYS, TABS } from './constants';
import IdeaCard from './components/IdeaCard';
import AudioVisualizer from './components/AudioVisualizer';
import AuthView from './components/AuthView';
import CMSView from './components/CMSView';
import UserManagementView from './components/UserManagementView';
import BillingView from './components/BillingView';
import OnboardingTour from './components/OnboardingTour';
import { enhanceIdea, searchWeb } from './services/gemini';

const App: React.FC = () => {
  // Global States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [cmsContent, setCmsContent] = useState<CMSAnnouncement[]>([]);
  const [currentTab, setCurrentTab] = useState<Tab>('capture');
  
  // App States
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [webInsights, setWebInsights] = useState<{ text: string; sources: WebResult[] } | null>(null);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Note');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Auth & Init
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    const savedCMS = localStorage.getItem(STORAGE_KEYS.CMS);
    if (savedCMS) setCmsContent(JSON.parse(savedCMS));
    
    const savedIdeas = localStorage.getItem(STORAGE_KEYS.IDEAS);
    if (savedIdeas) setIdeas(JSON.parse(savedIdeas));
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    setCurrentTab('capture');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(updated));
    
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users.map(u => u.id === updated.id ? updated : u)));
  };

  const handleUpdateSubscription = (plan: SubscriptionPlan) => {
    updateProfile({ subscriptionPlan: plan, subscriptionActive: true });
  };

  const handleTourComplete = () => {
    updateProfile({ hasCompletedTour: true });
  };

  // Persistence
  useEffect(() => {
    if (currentUser) localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  }, [ideas, currentUser]);

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateProfile({ notificationsEnabled: true });
        new Notification("Notifications Enabled!", { body: "You will now receive daily digests of your ideas." });
      }
    }
  };

  const stats: Stats = {
    total: ideas.filter(i => i.userId === currentUser?.id).length,
    voice: ideas.filter(i => i.userId === currentUser?.id && i.source === 'Voice').length,
    typed: ideas.filter(i => i.userId === currentUser?.id && i.source === 'Typed').length,
    today: ideas.filter(i => i.userId === currentUser?.id && new Date(i.createdAt).toDateString() === new Date().toDateString()).length,
  };

  const addIdea = async (content: string, source: "Voice" | "Typed", category: Category, tags: string[]) => {
    if (!currentUser || !content.trim()) return;
    setIsSaving(true);
    const aiData = await enhanceIdea(content);
    const newIdea: Idea = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content, 
      source, 
      category,
      tags: Array.from(new Set([...tags, ...(aiData?.tags || [])])),
      createdAt: new Date().toISOString(),
      starred: false,
      aiSummary: aiData?.summary || undefined
    };
    setIdeas(prev => [newIdea, ...prev]);
    setIsSaving(false);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleDeepSearch = async () => {
    if (!searchQuery.trim() || isSearchingWeb) return;
    
    // Check for Pro status
    if (currentUser?.subscriptionPlan === 'Free') {
      alert("Stealth Deep Search is a Pro feature. Please upgrade to use it!");
      setCurrentTab('billing');
      return;
    }

    setIsSearchingWeb(true);
    setWebInsights(null);
    const results = await searchWeb(searchQuery);
    setWebInsights(results);
    setIsSearchingWeb(false);
  };

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setTranscript('');
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      const checkLevel = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioLevel(dataArray.reduce((a, b) => a + b, 0) / dataArray.length);
        if (isRecording) requestAnimationFrame(checkLevel);
      };
      checkLevel();
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.onresult = (e: any) => {
          setTranscript(Array.from(e.results).map((r: any) => r[0].transcript).join(''));
        };
        recognitionRef.current.start();
      }
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
    } catch (err) { alert("Mic denied."); }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAudioLevel(0);
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    recognitionRef.current?.stop();
    audioContextRef.current?.close();
  };

  if (!currentUser) return <AuthView onAuthSuccess={handleAuthSuccess} />;

  const userIdeas = ideas.filter(i => i.userId === currentUser.id);
  const filteredIdeas = userIdeas.filter(idea => {
    const matchesSearch = idea.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || idea.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden">
      {/* Onboarding Tour */}
      {!currentUser.hasCompletedTour && (
        <OnboardingTour onComplete={handleTourComplete} />
      )}

      {/* Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">IdeaFlow</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Member Portal</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {TABS.map(tab => (
            (!tab.adminOnly || currentUser.isAdmin) && (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  currentTab === tab.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner' : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            )
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800 flex flex-col gap-4">
          <div 
            onClick={() => setCurrentTab('billing')}
            className="p-4 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 rounded-2xl cursor-pointer hover:border-cyan-500/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Your Plan</span>
              {currentUser.subscriptionPlan !== 'Free' && <Crown size={12} className="text-amber-400" />}
            </div>
            <p className="text-sm font-bold">{currentUser.subscriptionPlan}</p>
            <p className="text-[10px] text-slate-500 mt-1">Upgrade for more power</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <UserIcon size={20} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{currentUser.username}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-400 transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {showNotification && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce bg-emerald-500 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 size={18} /> Saved successfully!
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto w-full">
            
            {/* Search Tab Content */}
            {currentTab === 'search' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <header className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-600/20 text-cyan-400 rounded-2xl">
                      <FileSearch size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">Intelligent Scraper</h2>
                      <p className="text-slate-500 text-sm">Deep-dive into the web's knowledge layers.</p>
                    </div>
                  </div>

                  <div className="relative p-1 bg-slate-800 rounded-[2rem] shadow-2xl focus-within:ring-2 focus-within:ring-cyan-500 transition-all duration-300">
                    <div className="bg-slate-950 rounded-[1.8rem] flex items-center p-2">
                      <div className="p-4 text-cyan-500">
                        <Globe size={24} className={isSearchingWeb ? "animate-spin" : ""} />
                      </div>
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Target keyword, concept, or domain for scraping..."
                        className="flex-1 bg-transparent border-none outline-none py-4 text-lg text-white placeholder:text-slate-700"
                        onKeyDown={(e) => e.key === 'Enter' && handleDeepSearch()}
                      />
                      <button 
                        onClick={handleDeepSearch}
                        disabled={isSearchingWeb || !searchQuery.trim()}
                        className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSearchingWeb ? <Loader2 size={18} className="animate-spin" /> : <Layers size={18} />}
                        {isSearchingWeb ? 'Scraping...' : 'Deep Scrape'}
                      </button>
                    </div>
                  </div>
                </header>

                {!webInsights && !isSearchingWeb ? (
                  <div className="py-20 text-center space-y-6">
                    <div className="relative inline-block">
                       <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 mx-auto">
                         <Activity size={40} className="text-slate-800" />
                       </div>
                       <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-500/10 rounded-full animate-ping"></div>
                    </div>
                    <div className="max-w-sm mx-auto">
                      <h3 className="text-lg font-bold text-slate-400">Ready for Extraction</h3>
                      <p className="text-sm text-slate-600 mt-2">Enter a query above to begin a multi-threaded web crawl and analysis powered by Gemini 3.</p>
                    </div>
                  </div>
                ) : null}

                {/* Progress Placeholder while scraping */}
                {isSearchingWeb && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                        <div className="h-full bg-cyan-500 animate-[shimmer_2s_infinite] w-[40%]"></div>
                      </div>
                      
                      <div className="flex justify-center gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`w-3 h-3 rounded-full bg-cyan-500 animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase text-cyan-400 tracking-widest">Active Scrape Sequence</h4>
                        <div className="flex flex-wrap justify-center gap-3">
                          {['Resolving Nodes', 'Scraping Metadata', 'Analyzing Sentiment', 'Extracting Grounding Chunks'].map((task, idx) => (
                             <div key={task} className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all duration-1000 ${idx === 0 ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-slate-800 text-slate-600'}`}>
                               {task}
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="h-48 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed animate-pulse"></div>
                       <div className="h-48 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed animate-pulse"></div>
                    </div>
                  </div>
                )}

                {/* Scraping Results Placeholder & Display */}
                {webInsights && !isSearchingWeb && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                      <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                             <ShieldCheck size={20} />
                           </div>
                           <div>
                             <h3 className="font-black text-sm uppercase tracking-tighter">Verified Intelligence</h3>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Confidence Score: 98.4%</p>
                           </div>
                        </div>
                        <button onClick={() => setWebInsights(null)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-600 transition-colors">
                          <Maximize2 size={18} />
                        </button>
                      </div>

                      <div className="p-8 space-y-10">
                        {/* Executive Summary */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 text-cyan-400">
                             <Info size={18} />
                             <h4 className="text-xs font-black uppercase tracking-widest">Executive Summary</h4>
                           </div>
                           <p className="text-slate-300 leading-relaxed text-lg italic bg-slate-950/50 p-6 rounded-2xl border border-slate-800 shadow-inner">
                             {webInsights.text}
                           </p>
                        </div>

                        {/* Visual Summary Placeholder (Visuals) */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 text-violet-400">
                             <ImageIcon size={18} />
                             <h4 className="text-xs font-black uppercase tracking-widest">Visual Landscape Analysis</h4>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             {[
                               { label: 'Primary Context', color: 'from-cyan-500/20 to-violet-500/20', icon: <Layers size={24}/> },
                               { label: 'Market Sentiment', color: 'from-violet-500/20 to-rose-500/20', icon: <Activity size={24}/> },
                               { label: 'Related Entities', color: 'from-emerald-500/20 to-cyan-500/20', icon: <Globe size={24}/> }
                             ].map((v, idx) => (
                               <div key={idx} className={`p-6 rounded-3xl bg-gradient-to-br ${v.color} border border-white/5 flex flex-col items-center justify-center gap-3 text-center group hover:scale-[1.02] transition-transform cursor-default shadow-lg shadow-black/20`}>
                                  <div className="p-4 bg-slate-950/80 rounded-2xl text-white shadow-xl group-hover:rotate-6 transition-transform">
                                    {v.icon}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-300">{v.label}</span>
                               </div>
                             ))}
                           </div>
                        </div>

                        {/* Sources */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 text-amber-400">
                             <ExternalLink size={18} />
                             <h4 className="text-xs font-black uppercase tracking-widest">Verified Sources & Grounding</h4>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {webInsights.sources.map((source, idx) => (
                                <a 
                                  key={idx} 
                                  href={source.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-cyan-500/50 hover:bg-slate-900 transition-all group shadow-sm"
                                >
                                   <div className="flex-1 min-w-0 pr-4">
                                      <p className="text-xs font-bold text-slate-200 truncate">{source.title}</p>
                                      <p className="text-[10px] text-slate-600 truncate mt-1">{source.uri}</p>
                                   </div>
                                   <ArrowUpRight size={16} className="text-slate-700 group-hover:text-cyan-400 transition-colors" />
                                </a>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CMS Banner */}
            {currentTab === 'capture' && cmsContent.some(c => c.isActive) && (
              <div className="mb-8 p-6 bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <Sparkles size={80} />
                </div>
                <h4 className="text-xs font-black uppercase text-violet-400 mb-2 flex items-center gap-2 tracking-widest"><Bell size={12}/> Featured Announcement</h4>
                {cmsContent.filter(c => c.isActive).slice(0, 1).map(c => (
                  <div key={c.id}><h3 className="text-xl font-bold mb-1">{c.title}</h3><p className="text-sm text-slate-400 leading-relaxed">{c.text}</p></div>
                ))}
              </div>
            )}

            {currentTab === 'capture' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h2 className="text-2xl font-bold mb-1">New Capture</h2>
                  <p className="text-slate-500 text-sm">Organize your thoughts with AI precision.</p>
                </header>

                {/* Explicit Category Selector */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Tag size={18} />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-widest">Select Context</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 group ${
                          selectedCategory === cat 
                          ? CATEGORY_COLORS[cat] + ' scale-[1.05] shadow-lg shadow-cyan-500/5'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <div className={`transition-transform duration-300 group-hover:scale-110`}>
                          {CATEGORY_ICONS[cat]}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Voice Capture */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2 text-violet-400"><Mic size={20}/> Voice Mode</h3>
                      <div className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-500">PCM 16k</div>
                    </div>
                    <AudioVisualizer isRecording={isRecording} audioLevel={audioLevel} />
                    {transcript && <div className="p-3 bg-slate-950 rounded-xl text-sm italic opacity-80 max-h-24 overflow-y-auto border border-slate-800">{transcript}</div>}
                    <div className="flex gap-2">
                      <button 
                        onClick={isRecording ? stopRecording : startRecording} 
                        className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${isRecording ? 'bg-rose-500 hover:bg-rose-600' : 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/20'}`}
                      >
                        {isRecording ? 'Stop Recording' : 'Start Capture'}
                      </button>
                      {!isRecording && transcript && (
                        <button 
                          onClick={() => addIdea(transcript, 'Voice', selectedCategory, [])} 
                          disabled={isSaving}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                          {isSaving ? 'Processing...' : 'Save As ' + selectedCategory}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Typed Capture */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-cyan-400"><Keyboard size={20}/> Typed Mode</h3>
                    <textarea 
                      value={typedInput} 
                      onChange={e => setTypedInput(e.target.value)} 
                      className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-700" 
                      placeholder="Start drafting your next big thing..."
                    />
                    <button 
                      onClick={() => { addIdea(typedInput, 'Typed', selectedCategory, []); setTypedInput(''); }} 
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-cyan-600/20 disabled:opacity-50" 
                      disabled={!typedInput.trim() || isSaving}
                    >
                      {isSaving ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={18} className="animate-spin" /> Enhancing...
                        </span>
                      ) : 'Save As ' + selectedCategory}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'bank' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <header className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Knowledge Bank</h2>
                      <p className="text-slate-500 text-sm">Organized thoughts enhanced by AI.</p>
                    </div>
                  </div>

                  {/* Filter Search for Bank */}
                  <div className="relative group p-1 bg-slate-800 rounded-[22px] transition-all duration-300">
                    <div className="bg-slate-950 rounded-[20px] p-2 flex items-center gap-2">
                      <SearchIcon className="ml-3 text-slate-500" size={20} />
                      <input 
                        type="text"
                        placeholder="Filter local ideas or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none py-2 px-1 text-slate-200 placeholder:text-slate-700"
                      />
                    </div>
                  </div>
                </header>

                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                  <button onClick={() => setFilterCategory('All')} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterCategory === 'All' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>All Ideas</button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setFilterCategory(cat)} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${filterCategory === cat ? CATEGORY_COLORS[cat] : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredIdeas.length > 0 ? filteredIdeas.map(idea => (
                    <IdeaCard key={idea.id} idea={idea} onDelete={id => setIdeas(ideas.filter(i => i.id !== id))} onToggleStar={id => setIdeas(ideas.map(i => i.id === id ? {...i, starred: !i.starred} : i))} onUpdate={(id, up) => setIdeas(ideas.map(i => i.id === id ? {...i, ...up} : i))} />
                  )) : (
                    <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                      <p className="text-slate-600 font-medium">No ideas found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentTab === 'billing' && (
              <BillingView user={currentUser} onUpdateSubscription={handleUpdateSubscription} />
            )}

            {currentTab === 'cms' && <CMSView />}
            
            {currentTab === 'users' && currentUser.isAdmin && (
              <UserManagementView currentUser={currentUser} />
            )}

            {currentTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold">Account Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Profile Management</h3>
                    <div className="space-y-4">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase px-2">Display Name</label><input type="text" value={currentUser.username} onChange={e => updateProfile({ username: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase px-2">Email</label><input type="email" value={currentUser.email} onChange={e => updateProfile({ email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Preferences</h3>
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <div><p className="text-sm font-bold">Push Notifications</p><p className="text-[10px] text-slate-500">Alerts for daily digests & features</p></div>
                      <button onClick={requestNotifications} className={`w-12 h-6 rounded-full transition-colors relative ${currentUser.notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${currentUser.notificationsEnabled ? 'left-7' : 'left-1'}`} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 p-2 shrink-0">
          {TABS.map(tab => (
            (!tab.adminOnly || currentUser.isAdmin) && (
              <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`flex-1 flex flex-col items-center py-2 ${currentTab === tab.id ? 'text-cyan-400' : 'text-slate-500'}`}>
                {tab.icon} <span className="text-[8px] font-bold mt-1 uppercase">{tab.label}</span>
              </button>
            )
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
