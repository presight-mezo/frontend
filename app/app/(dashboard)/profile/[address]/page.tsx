'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProfile } from '@/hooks/useApi';
import { formatUnits } from 'viem';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useSiweAuth } from '@/hooks/useSiweAuth';

export default function PublicProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const { getGlobalProfile, updateProfile } = useProfile();
  const { address: currentUserAddress } = useSiweAuth();
  
  const isOwner = currentUserAddress?.toLowerCase() === address.toLowerCase();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatarUrl: '', twitter: '' });

  useEffect(() => {
    if (address) {
      getGlobalProfile.execute(address);
    }
  }, [address]);

  const profile: any = getGlobalProfile.data;
  const loading = getGlobalProfile.loading;

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
        twitter: profile.twitter || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile.execute(editForm);
    setIsEditing(false);
    getGlobalProfile.execute(address);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 5MB size limit to prevent massive payload issues
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size exceeds 5MB limit. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = useMemo(() => {
    if (!profile) return [];
    return [
      {
        label: 'Conviction Score',
        value: (profile.totalConvictionScore ?? 0).toLocaleString(),
        icon: 'trending_up',
        color: 'text-mezo-teal',
      },
      {
        label: 'Markets Played',
        value: profile.marketsPlayed ?? 0,
        icon: 'sports_esports',
        color: 'text-blue-500',
      },
      {
        label: 'Win Rate',
        value: `${((profile.winRate ?? 0) * 100).toFixed(1)}%`,
        icon: 'workspace_premium',
        color: 'text-amber-500',
      },
      {
        label: 'Total MUSD Staked',
        value: parseFloat(formatUnits(BigInt(profile.totalStaked ?? "0"), 18)).toLocaleString(undefined, { maximumFractionDigits: 2 }),
        icon: 'account_balance_wallet',
        color: 'text-purple-500',
      },
      {
        label: 'Total MUSD Won',
        value: parseFloat(formatUnits(BigInt(profile.totalWon ?? "0"), 18)).toLocaleString(undefined, { maximumFractionDigits: 2 }),
        icon: 'payments',
        color: 'text-emerald-500',
      },
    ];
  }, [profile]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    // Could add a toast here
  };

  if (loading) {
    return (
      <section className="p-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!profile && !loading) {
    return (
      <section className="p-8 flex flex-col items-center justify-center h-[60vh]">
        <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">person_off</span>
        <h2 className="text-xl font-bold text-gray-500">Profile not found</h2>
        <p className="text-sm text-gray-400 mt-2">This address hasn't participated in any prediction markets yet.</p>
      </section>
    );
  }

  return (
    <section className="p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 pb-8 border-b border-gray-100/50">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg border-4 border-white shrink-0 bg-gray-50 flex items-center justify-center">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Jazzicon address={address} />
            )}
          </div>
          <div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-black uppercase">
              {profile?.username || `${address.slice(0, 6)}...${address.slice(-4)}`}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                {address}
              </span>
              <button 
                onClick={copyToClipboard}
                className="p-1.5 text-gray-400 hover:text-mezo-teal transition-colors"
                title="Copy profile link"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
              {profile?.twitter && (
                <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 shadow-sm transition-colors">
                  <span className="material-symbols-outlined text-[14px]">tag</span>
                  {profile.twitter}
                </a>
              )}
            </div>
            {profile?.bio && (
              <p className="mt-4 text-sm text-gray-600 max-w-xl leading-relaxed font-medium">
                {profile.bio}
              </p>
            )}
            
            {/* Dynamic Badges */}
            <div className="flex flex-wrap gap-2 mt-5">
               <div className="px-3 py-1.5 bg-mezo-teal/10 rounded-full border border-mezo-teal/20 shadow-sm">
                 <span className="text-[10px] font-black text-mezo-teal uppercase tracking-wider flex items-center gap-1.5">
                   <span className="material-symbols-outlined text-[13px]">verified</span>
                   Mezo Pioneer
                 </span>
               </div>
               <div className={`px-3 py-1.5 rounded-full border shadow-sm ${profile?.defaultRiskMode === 'zero-risk' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                 <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                   <span className="material-symbols-outlined text-[13px]">{profile?.defaultRiskMode === 'zero-risk' ? 'shield' : 'local_fire_department'}</span>
                   {profile?.defaultRiskMode === 'zero-risk' ? 'Zero-Risk Staker' : 'Full-Stake Degen'}
                 </span>
               </div>
            </div>
          </div>
        </div>
        
        {isOwner && (
          <div className="shrink-0 mt-2 md:mt-0">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-5 py-2.5 border-2 border-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        )}
      </div>

      {/* Edit Form Inline Modal */}
      {isEditing && (
        <div className="mb-12 p-8 bg-gray-50 rounded-[32px] border border-gray-200/60 shadow-inner">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
               <span className="material-symbols-outlined text-white text-sm">edit</span>
             </div>
             <h2 className="text-xl font-black uppercase tracking-tight text-black">Edit Profile Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Username</label>
              <input 
                type="text" 
                value={editForm.username} 
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-mezo-teal text-sm font-bold text-black shadow-sm transition-colors"
                placeholder="DegenKing99"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Twitter Handle</label>
              <input 
                type="text" 
                value={editForm.twitter} 
                onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-blue-500 text-sm font-bold text-black shadow-sm transition-colors"
                placeholder="@username"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Avatar Image</label>
              <div className="flex items-center gap-4 border-2 border-gray-200 rounded-2xl p-2 bg-white shadow-sm transition-colors focus-within:border-mezo-teal">
                {editForm.avatarUrl ? (
                   <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                     <img src={editForm.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                   </div>
                ) : (
                   <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                     <span className="material-symbols-outlined text-gray-300">person</span>
                   </div>
                )}
                
                <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors border border-gray-200/50">
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                
                {editForm.avatarUrl && (
                  <button 
                    onClick={() => setEditForm(prev => ({ ...prev, avatarUrl: '' }))}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto material-symbols-outlined text-sm flex items-center justify-center"
                    title="Remove Image"
                  >
                    delete
                  </button>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Bio</label>
              <textarea 
                value={editForm.bio} 
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-mezo-teal text-sm font-bold text-black shadow-sm transition-colors resize-none"
                placeholder="Tell us about your prediction strategies..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleSaveProfile}
              disabled={updateProfile.loading}
              className="px-8 py-3.5 bg-[#f97316] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#ea580c] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
            >
              {updateProfile.loading ? (
                <>Saving...</>
              ) : (
                <>Save Profile <span className="material-symbols-outlined text-sm">check</span></>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-mezo-teal/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-mezo-teal/5 transition-colors ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for future sections like "Recent Activity" or "Open Positions" */}
        <div className="p-8 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-gray-200 text-5xl mb-4">history</span>
          <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Recent Activity coming soon</p>
        </div>
        <div className="p-8 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-gray-200 text-5xl mb-4">pie_chart</span>
          <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Portfolio Analytics coming soon</p>
        </div>
      </div>
    </section>
  );
}
