
import React, { useState } from 'react';
import { Check, Zap, Shield, Crown, CreditCard, Loader2 } from 'lucide-react';
import { User, SubscriptionPlan } from '../types';

interface BillingViewProps {
  user: User;
  onUpdateSubscription: (plan: SubscriptionPlan) => void;
}

const PLANS = [
  {
    name: 'Free' as SubscriptionPlan,
    price: '$0',
    features: ['Basic Idea Recording', '3 Tags per Idea', 'Standard Search', 'LocalStorage Sync'],
    color: 'slate',
    icon: <Zap size={20} />,
    description: 'Perfect for starters.'
  },
  {
    name: 'Pro' as SubscriptionPlan,
    price: '$9.99',
    interval: '/mo',
    features: ['Unlimited Recordings', 'AI-Enhanced Summaries', 'Stealth Deep Search', 'Priority Support'],
    color: 'cyan',
    icon: <Shield size={20} />,
    popular: true,
    description: 'For power users.'
  },
  {
    name: 'Enterprise' as SubscriptionPlan,
    price: '$49.99',
    interval: '/mo',
    features: ['Custom AI Models', 'Team Workspaces', 'Bulk Data Export', 'Dedicated Account Manager'],
    color: 'violet',
    icon: <Crown size={20} />,
    description: 'For growing businesses.'
  }
];

const BillingView: React.FC<BillingViewProps> = ({ user, onUpdateSubscription }) => {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (plan === user.subscriptionPlan) return;
    
    setLoadingPlan(plan);
    
    // Simulation of PayPal Checkout Flow
    // In a real app, you'd use @paypal/react-paypal-js and open the modal here
    setTimeout(() => {
      onUpdateSubscription(plan);
      setLoadingPlan(null);
      alert(`Success! You have been upgraded to the ${plan} plan via PayPal.`);
    }, 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
          Upgrade Your Flow
        </h2>
        <p className="text-slate-500 text-sm">Choose the plan that fits your creative velocity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div 
            key={plan.name}
            className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300 ${
              plan.popular 
              ? 'bg-slate-900 border-cyan-500/50 shadow-2xl shadow-cyan-500/10 scale-105 z-10' 
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-widest shadow-lg">
                Most Popular
              </span>
            )}

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
              plan.name === 'Pro' ? 'bg-cyan-500/20 text-cyan-400' : 
              plan.name === 'Enterprise' ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {plan.icon}
            </div>

            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <p className="text-xs text-slate-500 mb-4">{plan.description}</p>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-white">{plan.price}</span>
              {plan.interval && <span className="text-slate-500 text-sm">{plan.interval}</span>}
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-emerald-500" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSubscribe(plan.name)}
              disabled={loadingPlan !== null || user.subscriptionPlan === plan.name}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                user.subscriptionPlan === plan.name 
                ? 'bg-slate-800 text-slate-500 cursor-default' 
                : plan.popular
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 active:scale-95'
                  : 'bg-white text-slate-950 hover:bg-slate-200 active:scale-95'
              }`}
            >
              {loadingPlan === plan.name ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {user.subscriptionPlan === plan.name ? 'Current Plan' : (
                    <>
                      <CreditCard size={18} /> Pay with PayPal
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold flex items-center gap-2 justify-center md:justify-start">
            <Shield size={18} className="text-cyan-400" /> Secure Payment via PayPal
          </h4>
          <p className="text-xs text-slate-500">Your payments are handled securely by PayPal. Cancel anytime in your account settings.</p>
        </div>
        <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Global Encryption</div>
        </div>
      </div>
    </div>
  );
};

export default BillingView;
