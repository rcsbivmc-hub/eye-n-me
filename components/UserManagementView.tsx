
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Shield, 
  Mail, 
  Calendar, 
  ChevronDown, 
  Filter,
  X,
  Check,
  MoreVertical,
  Plus,
  Loader2
} from 'lucide-react';
import { User, SubscriptionPlan } from '../types';
import { STORAGE_KEYS } from '../constants';

interface UserManagementViewProps {
  currentUser: User;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'username' | 'joinedAt' | 'subscriptionPlan'>('joinedAt');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', isAdmin: false, subscriptionPlan: 'Free' as SubscriptionPlan });

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    setUsers(savedUsers);
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (confirm("Are you sure you want to delete this user? All their ideas will be inaccessible.")) {
      saveUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleToggleAdmin = (userId: string) => {
    if (userId === currentUser.id) {
      alert("You cannot remove your own admin status.");
      return;
    }
    saveUsers(users.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.email === newUser.email)) {
      alert("A user with this email already exists.");
      return;
    }

    // Fix: Added missing required property 'hasCompletedTour'
    const createdUser: User = {
      id: Date.now().toString(),
      email: newUser.email,
      username: newUser.username,
      password: newUser.password,
      isAdmin: newUser.isAdmin,
      notificationsEnabled: false,
      joinedAt: new Date().toISOString(),
      subscriptionPlan: newUser.subscriptionPlan,
      subscriptionActive: true,
      hasCompletedTour: false
    };

    saveUsers([createdUser, ...users]);
    setIsAddingUser(false);
    setNewUser({ username: '', email: '', password: '', isAdmin: false, subscriptionPlan: 'Free' });
  };

  const filteredUsers = users
    .filter(u => 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'username') return a.username.localeCompare(b.username);
      if (sortField === 'joinedAt') return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      return a.subscriptionPlan.localeCompare(b.subscriptionPlan);
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-cyan-400" /> User Management
          </h2>
          <p className="text-slate-500 text-sm">Monitor and control access to the IdeaFlow platform.</p>
        </div>
        <button 
          onClick={() => setIsAddingUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-500/20"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'bg-cyan-500' },
          { label: 'Admins', value: users.filter(u => u.isAdmin).length, color: 'bg-violet-500' },
          { label: 'Pro Members', value: users.filter(u => u.subscriptionPlan === 'Pro').length, color: 'bg-amber-500' },
          { label: 'Enterprise', value: users.filter(u => u.subscriptionPlan === 'Enterprise').length, color: 'bg-emerald-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative inline-block">
            <select 
              value={sortField}
              onChange={e => setSortField(e.target.value as any)}
              className="appearance-none bg-slate-950 border border-slate-800 rounded-xl py-2 pl-4 pr-10 text-sm text-slate-400 outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="joinedAt">Joined Recently</option>
              <option value="username">Name A-Z</option>
              <option value="subscriptionPlan">Plan Status</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-[2rem] shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Register New User</h3>
              <button onClick={() => setIsAddingUser(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Display Name</label>
                <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500 text-white" placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Email Address</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500 text-white" placeholder="user@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Password</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500 text-white" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Subscription</label>
                  <select value={newUser.subscriptionPlan} onChange={e => setNewUser({...newUser, subscriptionPlan: e.target.value as SubscriptionPlan})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500 text-slate-400">
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                   <button 
                    type="button"
                    onClick={() => setNewUser({...newUser, isAdmin: !newUser.isAdmin})}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${newUser.isAdmin ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                   >
                    <span className="text-xs font-bold">Admin Privs</span>
                    {newUser.isAdmin ? <ShieldCheck size={16} /> : <Shield size={16} />}
                   </button>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-cyan-500/20 active:scale-95">Create User Account</button>
            </form>
          </div>
        </div>
      )}

      {/* Users Table / Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">User Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Plan</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Joined At</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shadow-inner ${user.isAdmin ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200 flex items-center gap-1">
                          {user.username} {user.isAdmin && <ShieldCheck size={14} className="text-cyan-400" title="Administrator" />}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 leading-none mt-1">
                          <Mail size={12} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      user.subscriptionPlan === 'Enterprise' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      user.subscriptionPlan === 'Pro' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {user.subscriptionPlan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-600" />
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.subscriptionActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{user.subscriptionActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleToggleAdmin(user.id)}
                        className={`p-2 rounded-lg transition-colors ${user.isAdmin ? 'text-cyan-400 hover:bg-cyan-500/10' : 'text-slate-600 hover:bg-slate-800'}`}
                        title={user.isAdmin ? "Remove Admin Status" : "Promote to Admin"}
                      >
                        <Shield size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-20 text-center space-y-3">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
               <Users size={32} />
             </div>
             <p className="text-slate-500 font-medium">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementView;
