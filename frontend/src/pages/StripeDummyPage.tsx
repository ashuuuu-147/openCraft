// frontend/src/pages/StripeDummyPage.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, Award, ArrowUpRight, HelpCircle, ShieldCheck, Check, Sparkles, Loader2, CheckCircle, Receipt } from 'lucide-react';
import { User, Reward } from '../types';

interface StripeDummyPageProps {
  user: User | null;
  addToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const StripeDummyPage: React.FC<StripeDummyPageProps> = ({ user, addToast }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(true);
  
  // Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState<{ name: string; price: string } | null>(null);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      // Fetch user profile which has rewards embedded
      fetch(`/api/users/profile/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.rewards) {
            setRewards(data.rewards);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleConnectStripe = () => {
    setStripeConnected(true);
    addToast('Mock Stripe account connected successfully!', 'success');
  };

  const handleDisconnectStripe = () => {
    setStripeConnected(false);
    addToast('Mock Stripe account disconnected.', 'info');
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaySuccess(true);
      addToast(`Subscription for ${checkoutPlan?.name} approved!`, 'success');
      setTimeout(() => {
        setCheckoutPlan(null);
        setPaySuccess(false);
      }, 2000);
    }, 2500);
  };

  const isOrg = user?.role === 'ORG_ADMIN';

  const developerPlans = [
    { 
      name: 'Developer Free', 
      price: '0.00', 
      desc: 'Standard contribution capabilities.', 
      features: ['Standard reviews (3-5 days)', '1 active task claim', 'Community support access', 'Public developer profile'] 
    },
    { 
      name: 'Developer Pro', 
      price: '9.99', 
      desc: 'Accelerate your open source journey.', 
      features: ['Priority mentor review (< 24h)', '3 active claims concurrently', 'Premium profile highlight', 'Advanced contributions stats'] 
    },
    { 
      name: 'Developer Elite', 
      price: '29.99', 
      desc: 'Direct track to professional hiring.', 
      features: ['Express reviews (< 12h)', 'Unlimited active task claims', 'Direct recruiter chat channel', 'Leaderboard premium styling'] 
    },
  ];

  const orgPlans = [
    { 
      name: 'Org Standard', 
      price: '0.00', 
      desc: 'Basic open source task listing.', 
      features: ['Post up to 2 active task listings', 'Standard review queue priority', 'Basic contributor filtering', 'Public company details profile'] 
    },
    { 
      name: 'Startup Starter', 
      price: '49.00', 
      desc: 'Deploy tasks and scout junior talent.', 
      features: ['List up to 10 active tasks', 'Verified developer search access', 'GitHub automated reviews sync', 'Priority developer email support'] 
    },
    { 
      name: 'Growth Core', 
      price: '199.00', 
      desc: 'For scaling code repositories.', 
      features: ['Unlimited active task listings', 'Custom recruiter channels', 'Direct messaging with contributors', 'Dedicated representative'] 
    },
  ];

  const plans = isOrg ? orgPlans : developerPlans;
  const featuredPlanName = isOrg ? 'Startup Starter' : 'Developer Pro';

  const totalEarned = rewards.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.cash, 0);

  const mockOrgInvoices = [
    { id: 'INV-9013', type: 'Subscription Payment (Startup Starter)', amount: 49.00, date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toLocaleDateString(), status: 'PAID' },
    { id: 'BTY-4812', type: 'Bounty Funding (Issue #41: Refactor auth)', amount: 250.00, date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toLocaleDateString(), status: 'PAID' },
    { id: 'BTY-3129', type: 'Bounty Funding (Issue #23: Fix footer)', amount: 100.00, date: new Date(Date.now() - 20 * 24 * 3600 * 1000).toLocaleDateString(), status: 'PAID' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      
      {/* 1. Page Header */}
      <div className="space-y-1">
        <h2 className="font-display text-2xl sm:text-3xl font-normal tracking-lg text-ink flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-primary" />
          {isOrg ? 'Corporate Billing & Subscriptions' : 'Financial Ledger & Payouts'}
        </h2>
        <p className="text-sm text-body">
          {isOrg 
            ? 'Manage organization billing details, subscriptions, invoices, and bounty funding escrow accounts.' 
            : 'Track individual code contributions rewards, configure Stripe connected account payouts, and upgrade developer status.'}
        </p>
      </div>

      {/* 2. Status Box & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Stripe connection status */}
        <div className="md:col-span-6 p-6 cursor-card bg-white space-y-4">
          <h3 className="font-display font-normal text-xs text-muted uppercase tracking-wider">
            {isOrg ? 'Stripe Billing Connection' : 'Stripe Payout Link'}
          </h3>
          
          <div className="flex items-center justify-between p-4 rounded-md border border-hairline bg-canvas-soft">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-md border border-hairline bg-white text-ink">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 font-mono">
                <div className="text-xs font-bold text-ink">
                  {isOrg ? 'Stripe Gateway' : 'Stripe Connect Status'}
                </div>
                <div className={`text-[10px] font-bold ${stripeConnected ? 'text-semantic-success' : 'text-semantic-error'}`}>
                  {stripeConnected ? 'CONNECTED & ACTIVE' : 'DISCONNECTED'}
                </div>
              </div>
            </div>

            {stripeConnected ? (
              <button
                onClick={handleDisconnectStripe}
                className="text-[10px] font-mono text-semantic-error hover:underline"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectStripe}
                className="text-[10px] font-mono text-primary hover:underline font-bold"
              >
                Connect Account
              </button>
            )}
          </div>

          <p className="text-xs text-body leading-relaxed font-mono">
            {isOrg 
              ? 'Subscriptions and task bounty payments are securely transacted through Stripe. A receipt will be sent to your organization email.'
              : 'Earnings from approved pull request submissions are automatically routed to your Stripe account within 3 business days of mentor approval.'}
          </p>
        </div>

        {/* Stats card */}
        <div className="md:col-span-6 p-6 cursor-card bg-white flex flex-col justify-between">
          <h3 className="font-display font-normal text-xs text-muted uppercase tracking-wider">
            {isOrg ? 'Corporate Funding Ledger' : 'Earnings Summary'}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 my-2">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted">
                {isOrg ? 'TOTAL FUNDED' : 'TOTAL EARNED'}
              </span>
              <div className="text-3xl font-display font-normal text-ink tracking-md">
                ${isOrg ? '399.00' : totalEarned.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted">
                {isOrg ? 'ACTIVE LISTINGS' : 'ACTIVE CLAIMS'}
              </span>
              <div className="text-3xl font-display font-normal text-ink tracking-md">
                {isOrg ? '2 Tasks' : rewards.filter(r => r.status === 'PENDING').length}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted font-mono leading-relaxed mt-2 pt-2 border-t border-hairline">
            &gt; ledger balance verified on-chain.
          </p>
        </div>

      </div>

      {/* 3. Pricing Grid (Subscriptions) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-normal tracking-lg text-ink flex items-center gap-2">
            <Sparkles className="text-primary w-5 h-5 animate-pulse" />
            {isOrg ? 'Organization Premium Plans' : 'Professional Contributor Status'}
          </h3>
          <p className="text-xs text-body">
            {isOrg
              ? 'Upgrade to scale your open-source repositories and attract premier developer contributors.'
              : 'Unlock advanced developer capabilities, faster reviews, and priority paid bounty listings.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isFeatured = plan.name === featuredPlanName;
            return (
              <div
                key={plan.name}
                className={`p-8 cursor-card flex flex-col justify-between hover:border-hairline-strong transition-all duration-300 relative overflow-hidden group ${
                  isFeatured ? 'bg-ink text-canvas border-ink' : 'bg-white text-ink border-hairline'
                }`}
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h4 className={`font-display font-normal tracking-md text-base ${isFeatured ? 'text-canvas' : 'text-ink'}`}>
                      {plan.name}
                    </h4>
                    <p className={`text-xs leading-relaxed h-8 ${isFeatured ? 'text-canvas/80' : 'text-body'}`}>
                      {plan.desc}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-normal font-display">$</span>
                    <span className="text-4xl font-normal font-display tracking-lg">
                      {plan.price.split('.')[0]}
                    </span>
                    <span className={`text-[10px] font-mono ${isFeatured ? 'text-canvas/60' : 'text-muted'}`}>
                      / month
                    </span>
                  </div>

                  <hr className={isFeatured ? 'border-body' : 'border-hairline'} />

                  <ul className="space-y-2 text-xs font-mono">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isFeatured ? 'text-primary' : 'text-semantic-success'}`} />
                        <span className={isFeatured ? 'text-canvas/90' : 'text-body'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setCheckoutPlan({ name: plan.name, price: plan.price })}
                  className={`w-full mt-6 py-2.5 rounded-md text-xs font-mono font-bold transition-all ${
                    isFeatured
                      ? 'bg-canvas text-ink hover:bg-canvas-soft border border-canvas'
                      : 'btn-cursor-primary'
                  }`}
                >
                  {plan.price === '0.00' ? 'Active Tier' : 'Subscribe'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Transaction Log Table */}
      <section className="space-y-4">
        <h3 className="font-display font-normal text-xs text-muted uppercase tracking-wider flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          {isOrg ? 'Billing & Funding Ledger Log' : 'Earnings Transaction Log'}
        </h3>
        
        {isOrg ? (
          <div className="overflow-x-auto rounded-md border border-hairline bg-white">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-canvas-soft text-body">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Amount Funded</th>
                  <th className="p-4">Date Logged</th>
                  <th className="p-4">Billing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-body">
                {mockOrgInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="p-4 text-ink font-bold">{inv.id}</td>
                    <td className="p-4">{inv.type}</td>
                    <td className="p-4 text-primary font-bold">${inv.amount.toFixed(2)}</td>
                    <td className="p-4">{inv.date}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm border text-semantic-success bg-semantic-success/10 border-semantic-success/20">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : loading ? (
          <div className="h-32 bg-white animate-pulse border border-hairline rounded-md w-full"></div>
        ) : rewards.length === 0 ? (
          <div className="p-8 text-center rounded-md border border-hairline bg-white">
            <p className="text-xs font-mono text-body">
              No transactions logged yet. Complete tasks that award bounties to trigger payouts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-hairline bg-white">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-canvas-soft text-body">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Bounty Reward</th>
                  <th className="p-4">Date Logged</th>
                  <th className="p-4">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-body">
                {rewards.map((rew) => (
                  <tr key={rew.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="p-4 text-ink font-bold">TX_{rew.id.slice(-6)}</td>
                    <td className="p-4 text-primary font-bold">${rew.cash.toFixed(2)}</td>
                    <td className="p-4">{new Date(rew.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${
                        rew.status === 'PAID'
                          ? 'text-semantic-success bg-semantic-success/10 border-semantic-success/20'
                          : rew.status === 'PENDING'
                            ? 'text-muted bg-canvas border-hairline'
                            : 'text-semantic-error bg-semantic-error/10 border-semantic-error/20'
                      }`}>
                        {rew.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. Checkout Modal Overlay */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-hairline rounded-lg p-6 max-w-sm w-full space-y-6 relative animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-primary">
                  <CreditCard className="w-4 h-4" />
                  <span>SECURE STRIPE CHECKOUT</span>
                </div>
                <h3 className="font-display font-normal tracking-lg text-lg text-ink">
                  Subscribe to {checkoutPlan.name}
                </h3>
              </div>

              {paySuccess ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-primary animate-bounce" />
                  <span className="font-mono text-sm text-primary font-bold">PAYMENT APPROVED!</span>
                  <p className="text-xs text-body font-mono">
                    Your account capabilities have been upgraded.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs font-mono text-left">
                  
                  {/* Summary */}
                  <div className="flex justify-between items-center p-3 rounded-md border border-hairline bg-canvas-soft">
                    <span className="text-body text-[10px]">Plan Total</span>
                    <span className="text-ink font-normal font-display text-base tracking-md">${checkoutPlan.price} / mo</span>
                  </div>

                  {/* Card Form Mock */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-body font-bold text-[10px]">CARD NUMBER</label>
                      <input
                        type="text"
                        required
                        defaultValue="4242 4242 4242 4242"
                        className="w-full px-4 py-2.5 rounded-md border border-hairline bg-white text-ink text-sm focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-body font-bold text-[10px]">EXPIRATION</label>
                        <input
                          type="text"
                          required
                          defaultValue="12/29"
                          className="w-full px-4 py-2.5 rounded-md border border-hairline bg-white text-ink text-sm focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors text-center"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-body font-bold text-[10px]">CVC</label>
                        <input
                          type="text"
                          required
                          defaultValue="123"
                          className="w-full px-4 py-2.5 rounded-md border border-hairline bg-white text-ink text-sm focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutPlan(null)}
                      className="flex-1 py-2.5 rounded border border-hairline hover:border-hairline-strong text-body font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={paying}
                      className="flex-1 btn-cursor-primary py-2.5 rounded-md flex items-center justify-center gap-1"
                    >
                      {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay $${checkoutPlan.price}`}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
