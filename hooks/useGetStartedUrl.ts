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
          const targetUrl = onboardingCompleted || hasMandate ? '/app/dashboard' : '/app/onboarding';
          if (url !== targetUrl) {
            setUrl(targetUrl);
          }
        }
      };
      checkStatus();
    } else if (url !== '/app/onboarding') {
      setUrl('/app/onboarding');
    }
  }, [isAuthenticated, token]);

  return url;
}
