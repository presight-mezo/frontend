'use client';

import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useProfile } from '@/hooks/useApi';
import { useEffect, useState } from 'react';

export function useGetStartedUrl() {
  const { isAuthenticated, token } = useSiweAuth();
  const { getProfile } = useProfile(token || undefined);
  const [url, setUrl] = useState('/app/onboarding');

  useEffect(() => {
    if (isAuthenticated && token) {
      const checkStatus = async () => {
        const res = await getProfile.execute();
        if (res.data) {
          const { onboardingCompleted, hasMandate } = res.data as any;
          if (onboardingCompleted || hasMandate) {
            setUrl('/app/dashboard');
          } else {
            setUrl('/app/onboarding');
          }
        }
      };
      checkStatus();
    } else {
      setUrl('/app/onboarding');
    }
  }, [isAuthenticated, token, getProfile.execute]);

  return url;
}
