'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useProfile } from '@/hooks/useApi';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, isLoading: isAuthLoading } = useSiweAuth();
  const { getProfile } = useProfile(token || undefined);
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileChecking, setIsProfileChecking] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for auth to settle
    if (isAuthLoading) return;

    // Handle Unauthenticated State
    if (!isAuthenticated || !token) {
      if (pathname.startsWith("/app") && pathname !== "/app/onboarding") {
        router.push("/");
      } else {
        setIsReady(true);
      }
      return;
    }

    let isMounted = true;
    setIsProfileChecking(true);

    const checkProfile = async () => {
      const res = await getProfile.execute();
      if (!isMounted) return;
      setIsProfileChecking(false);

      if (res.data) {
        const { onboardingCompleted, hasMandate } = res.data as any;
        
        // As per the user's request, we auto-skip if they already have a mandate from before (e.g. on new device)
        const isOnboarded = onboardingCompleted || hasMandate;
        
        if (!isOnboarded && !pathname.startsWith('/app/onboarding')) {
          router.push('/app/onboarding');
        } else if (isOnboarded && pathname.startsWith('/app/onboarding')) {
          router.push('/app/dashboard');
        } else {
          setIsReady(true);
        }
      } else {
        // If there's an error fetching the profile, fail open and show the UI to avoid blank screen locks
        setIsReady(true);
      }
    };

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token, pathname, router]);

  // While checking the backend profile status, we can hide the children
  // We could implement a skeleton or branded spinner, but null is safest to avoid flashes of wrong UI
  if (!isReady) return null; 

  return <>{children}</>;
}
