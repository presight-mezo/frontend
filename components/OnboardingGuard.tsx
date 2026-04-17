'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePresightApi } from '@/lib/ApiProvider';
import { useProfile } from '@/hooks/useApi';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, isLoading: isAuthLoading } = usePresightApi();
  const { getProfile } = useProfile(token || undefined);
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileChecking, setIsProfileChecking] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('[OnboardingGuard] Effect triggered:', { isAuthLoading, isAuthenticated, pathname });
    
    // Wait for auth to settle
    if (isAuthLoading) return;

    // Handle Unauthenticated State
    if (!isAuthenticated || !token) {
      console.log('[OnboardingGuard] Not authenticated. Path:', pathname);
      if (pathname.startsWith("/app") && pathname !== "/app/onboarding") {
        console.log('[OnboardingGuard] Redirecting to home...');
        router.push("/");
      } else {
        setIsReady(true);
      }
      return;
    }

    let isMounted = true;
    setIsProfileChecking(true);

    const checkProfile = async () => {
      console.log('[OnboardingGuard] Checking profile...');
      
      // Fail-safe timeout to prevent permanent blank screen if API hangs
      const timeoutId = setTimeout(() => {
        if (isMounted && !isReady) {
          console.warn('[OnboardingGuard] Profile check timed out. Failing open.');
          setIsReady(true);
          setIsProfileChecking(false);
        }
      }, 5000);

      try {
        const res = await getProfile.execute();
        clearTimeout(timeoutId);
        
        if (!isMounted) return;
        setIsProfileChecking(false);

        if (res.data) {
          const { onboardingCompleted, hasMandate } = res.data as any;
          console.log('[OnboardingGuard] Profile data:', { onboardingCompleted, hasMandate });
          
          // As per the user's request, we auto-skip if they already have a mandate from before (e.g. on new device)
          const isOnboarded = onboardingCompleted || hasMandate;
          
          if (!isOnboarded && !pathname.startsWith('/app/onboarding')) {
            console.log('[OnboardingGuard] Not onboarded. Redirecting to onboarding...');
            router.push('/app/onboarding');
          } else if (isOnboarded && pathname.startsWith('/app/onboarding')) {
            console.log('[OnboardingGuard] Already onboarded. Redirecting to dashboard...');
            router.push('/app/dashboard');
          } else {
            console.log('[OnboardingGuard] State matches path. Ready.');
            setIsReady(true);
          }
        } else {
          console.warn('[OnboardingGuard] No profile data or error. Failing open.');
          setIsReady(true);
        }
      } catch (err) {
        console.error('[OnboardingGuard] Profile check error:', err);
        clearTimeout(timeoutId);
        if (isMounted) setIsReady(true);
      }
    };

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token, isAuthLoading, pathname, router]);

  // While checking the backend profile status, show a beautiful loading state
  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white" suppressHydrationWarning>
        <div className="flex flex-col items-center gap-6">
          {/* Branded loading animation */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-black/5 rounded-full" />
            <div 
              className="absolute inset-0 border-4 border-mezo-yellow rounded-full animate-spin" 
              style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black">Initializing</h2>
            <p className="text-xs text-black/40 font-bold uppercase tracking-widest">
              {isAuthLoading ? 'Securing Session' : 'Syncing Profile'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
