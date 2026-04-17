'use client';

import React, { useEffect, useState } from 'react';
import { useProfile, useMandate } from '@/hooks/useApi';
import { usePresightApi } from '@/lib/ApiProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  ShieldCheck, 
  Flame, 
  Wallet, 
  LogOut, 
  Bot, 
  LockOpen, 
  Zap, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  History,
  Settings,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const { token, address, signOut } = usePresightApi();
  const { getProfile, updateProfile } = useProfile(token);
  const { getMandate, setMandate, revokeMandate } = useMandate(token);

  const [limitInput, setLimitInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      getProfile.execute();
      getMandate.execute();
    }
  }, [token]);

  useEffect(() => {
    if (getMandate.data) {
      const formatted = (Number((getMandate.data as any).limitPerMarket) / 1e18).toString();
      setLimitInput(formatted);
    }
  }, [getMandate.data]);

  const handleUpdateRiskMode = async (mode: 'zero-risk' | 'full-stake') => {
    const { error } = await updateProfile.execute({ defaultRiskMode: mode });
    if (!error) {
      getProfile.execute();
      showSuccess('Risk mode updated');
    }
  };

  const handleUpdateMandate = async () => {
    const amountWei = (Number(limitInput) * 1e18).toString();
    const { error } = await setMandate.execute({ limitPerMarket: amountWei });
    if (!error) {
      getMandate.execute();
      showSuccess('Mandate limit updated');
    }
  };

  const handleRevoke = async () => {
    if (confirm('Are you sure you want to revoke your prediction mandate? AI auto-predictions will be disabled.')) {
      const { error } = await revokeMandate.execute();
      if (!error) {
        getMandate.execute();
        showSuccess('Mandate revoked');
      }
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const profile = getProfile.data as any;
  const mandate = getMandate.data as any;
  const hasMandate = !!mandate;

  const fmtAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <section className="py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-black/[0.03]">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-black uppercase">
            Settings
          </h1>
          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
            Mandate management & preferences
          </p>
        </div>

        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
            >
              <CheckCircle2 size={12} strokeWidth={3} />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Mandate Management - Bento Style */}
        <div className="col-span-12 xl:col-span-8">
          <Card className="bg-white rounded-3xl p-8 border border-black/[0.05] shadow-sm group hover:border-blue-500/20 transition-all overflow-hidden relative">
            <div className="flex justify-between items-start mb-10">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Passport Mandate
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${hasMandate ? "bg-emerald-500" : "bg-orange-500"} animate-pulse`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${hasMandate ? "text-emerald-500" : "text-orange-500"}`}>
                    {hasMandate ? "Active & Authorized" : "Setup Required"}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 shadow-sm">
                <Bot size={24} strokeWidth={2.5} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Daily Spend Limit (MUSD)</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                       <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 h-5 w-5" />
                       <Input 
                         type="number"
                         value={limitInput}
                         onChange={(e) => setLimitInput(e.target.value)}
                         className="pl-12 bg-gray-50/50 border-black/[0.03] text-black font-headline font-bold text-2xl h-14 rounded-2xl focus:border-blue-500/30 transition-all"
                         placeholder="0.00"
                       />
                    </div>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="rounded-2xl h-14 bg-black text-white hover:bg-black/90 px-8"
                      onClick={handleUpdateMandate}
                      isLoading={setMandate.loading}
                    >
                      Update
                    </Button>
                  </div>
                  <p className="mt-4 text-[11px] text-gray-400 leading-relaxed font-medium">
                    Limits the maximum amount the AI can stake per market.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between bg-gray-50/50 p-6 rounded-3xl border border-black/[0.03]">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-black">
                    <LockOpen size={16} strokeWidth={2.5} />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">Mandate Security</h3>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Predictions are gasless and secure. You maintain full custody via the Mezo Passport relay.
                  </p>
                </div>
                
                {hasMandate && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRevoke}
                    isLoading={revokeMandate.loading}
                    className="mt-6 border-red-500/10 text-red-500 hover:bg-red-50 rounded-xl font-bold uppercase tracking-widest text-[10px] h-10"
                  >
                    Revoke Permissions
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-black/[0.03] mt-10">
              <p className="text-[10px] text-gray-400 leading-relaxed italic">
                "Your passport authorizing predictive actions on the Mezo network."
              </p>
            </div>
          </Card>
        </div>

        {/* Global Risk Style */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           <Card className="bg-white rounded-3xl p-8 border border-black/[0.05] shadow-sm h-full">
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Global Preference
                </span>
                <span className="text-xl font-headline font-bold text-black uppercase tracking-tight">
                  Staking Mode
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                 <Zap size={18} strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleUpdateRiskMode('zero-risk')}
                className={`w-full group p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                  profile?.defaultRiskMode === 'zero-risk' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm shadow-emerald-500/5' 
                    : 'border-black/[0.05] bg-white hover:bg-gray-50 text-gray-400 hover:text-black'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  profile?.defaultRiskMode === 'zero-risk' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold uppercase text-[11px] tracking-widest">Zero-Risk</h3>
                  <p className="text-[9px] font-bold text-gray-400 leading-none mt-1 uppercase">Principal Protected</p>
                </div>
                {profile?.defaultRiskMode === 'zero-risk' && (
                  <CheckCircle2 size={16} strokeWidth={3} className="text-emerald-500" />
                )}
              </button>

              <button
                onClick={() => handleUpdateRiskMode('full-stake')}
                className={`w-full group p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                  profile?.defaultRiskMode === 'full-stake' 
                    ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-sm shadow-orange-500/5' 
                    : 'border-black/[0.05] bg-white hover:bg-gray-50 text-gray-400 hover:text-black'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  profile?.defaultRiskMode === 'full-stake' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Flame size={20} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold uppercase text-[11px] tracking-widest">Full-Stake</h3>
                  <p className="text-[9px] font-bold text-gray-400 leading-none mt-1 uppercase">Maximize Conviction</p>
                </div>
                {profile?.defaultRiskMode === 'full-stake' && (
                  <CheckCircle2 size={16} strokeWidth={3} className="text-orange-600" />
                )}
              </button>
            </div>
            
            <div className="mt-10 pt-6 border-t border-black/[0.03] space-y-2 flex items-center gap-3">
               <History size={14} className="text-gray-300" />
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
                 Updated preference applies to all future AI predictions.
               </p>
            </div>
          </Card>
        </div>

        {/* Account Details - Identity Card style */}
        <div className="col-span-12">
          <Card className="bg-white rounded-3xl p-8 border border-black/[0.05] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 border border-black/[0.05] flex items-center justify-center text-gray-900 shadow-inner">
                <Wallet size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Connected Wallet</span>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-headline font-bold text-black tabular-nums tracking-tighter">
                    {address ? fmtAddr(address) : 'Not Connected'}
                  </h3>
                  <div className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-tighter border border-emerald-100 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Verified
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-gray-50/50 border border-black/[0.03] flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure SIWE Session Active</span>
              </div>
              
              <Button 
                variant="outline" 
                size="md" 
                onClick={signOut}
                className="rounded-2xl border-black/[0.08] hover:border-red-500/20 text-gray-400 hover:text-red-500 px-6 font-bold uppercase tracking-widest text-[10px]"
                leftIcon={<LogOut size={14} />}
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
