'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { useGroups } from '@/hooks/useApi';
// Assuming a toast library exists or we use a basic alert for now
// In a real prod app, we'd use sonner or react-hot-toast

export function JoinGroupListener() {
  const { isAuthenticated, token } = useSiweAuth();
  const { joinGroup } = useGroups(token || undefined);
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedRef = useRef<string | null>(null);

  useEffect(() => {
    const groupId = searchParams.get('group');
    if (!isAuthenticated || !token || !groupId) return;

    // Prevent double-processing the same invitation in the same session
    if (processedRef.current === groupId) return;
    processedRef.current = groupId;

    const performJoin = async () => {
      try {
        console.log(`JoinGroupListener: Attempting to join group ${groupId}`);
        const res = await joinGroup.execute(groupId);
        
        if (res.data) {
          console.log(`JoinGroupListener: Successfully joined group ${groupId}`);
          // Clear parameters from the URL so they don't persist on refresh
          const params = new URLSearchParams(searchParams.toString());
          params.delete('group');
          params.delete('inviter');
          const newQuery = params.toString();
          router.replace(window.location.pathname + (newQuery ? `?${newQuery}` : ''));
          
          // Show a success message (using native alert for now as a fallback)
          // alert(`Successfully joined the group!`);
        }
      } catch (err) {
        console.error('JoinGroupListener: Error joining group:', err);
      }
    };

    performJoin();
  }, [isAuthenticated, token, searchParams, joinGroup, router]);

  return null; // Headless component
}
