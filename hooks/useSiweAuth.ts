'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { encodeSignatureAsToken, profileApi } from '@/lib/api';

export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  isLoading: boolean;
  error?: string;
  address?: string;
}

/**
 * Hook for SIWE authentication with backend
 * Generates a SIWE message, gets user signature, and exchanges for backend token
 */
export function useSiweAuth() {
  const { address, status } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true, // Start as loading to prevent premature redirects by guards
  });

  /**
   * Get SIWE message from user signature
   */
  const signIn = useCallback(
    async () => {
      console.log('useSiweAuth: Running signIn logic with address:', address);
      if (!address) {
        console.warn('useSiweAuth: No address found! Returning early.');
        setAuthState((prev) => ({
          ...prev,
          error: 'No account connected',
        }));
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        isLoading: true,
        error: undefined,
      }));

      try {
        const siweParams = {
          domain: window.location.host,
          address,
          statement: 'Sign in to Presight Prediction Market',
          uri: window.location.origin,
          version: '1',
          chainId: 31611, // Mezo Testnet
          nonce: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
          issuedAt: new Date().toISOString(),
        };

        console.log('useSiweAuth: Constructing SiweMessage with params:', siweParams);
        const message = new SiweMessage(siweParams);

        const messageStr = message.prepareMessage();
        const signature = await signMessageAsync({ 
          message: messageStr,
        });

        // Encode signature and message as token
        const token = encodeSignatureAsToken(messageStr, signature);

        // Verify token with backend by fetching profile
        const response = await profileApi.get(token);

        if (response.error) {
          throw new Error(response.error);
        }

        // Store token in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('presight_token', token);
        }

        setAuthState({
          isAuthenticated: true,
          token,
          address,
          isLoading: false,
        });

        return token;
      } catch (error) {
        console.error('useSiweAuth: Fatal error during signIn process:', error);
        const errorMessage = error instanceof Error ? error.message : 'Sign-in failed';
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
          address,
        });
      }
    },
    [address]
  );

  /**
   * Sign out
   */
  const signOut = useCallback(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem('presight_token');
    }
    setAuthState({
      isAuthenticated: false,
      token: undefined,
      isLoading: false,
      error: undefined,
      address: undefined,
    });
  }, []);

  /**
   * Restore token from localStorage if available
   */
  const restoreToken = useCallback(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const token = localStorage.getItem('presight_token');
      if (token && address) {
        setAuthState({
          isAuthenticated: true,
          token,
          address,
          isLoading: false,
        });
        return token;
      }
    }
    
    // If we couldn't restore a session, we still need to stop the loading state
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return null;
  }, [address]);

  // Hydration safety: wagmi often starts as 'disconnected' for a few frames on refresh
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Automatically attempt to restore token on initialization when address settles
  useEffect(() => {
    console.log('[useSiweAuth] Auth effect triggered:', { address, status, isAuthenticated: authState.isAuthenticated, isHydrated });
    
    // If wagmi is still initializing, wait
    if (status === 'connecting' || status === 'reconnecting') {
      console.log('[useSiweAuth] Wagmi still connecting. Waiting...');
      return;
    }

    // Handle potential delay in address population despite 'connected' status
    if (status === 'connected') {
      if (address) {
        if (!authState.isAuthenticated) {
          console.log('[useSiweAuth] Address detected, attempting token restoration...');
          restoreToken();
        } else {
          console.log('[useSiweAuth] Already authenticated with address. Settling.');
          if (authState.isLoading) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        }
      } else {
        console.log('[useSiweAuth] status is connected but address is still missing. Waiting...');
        // We stay in isLoading: true state here
      }
    } else if (status === 'disconnected') {
      // Only clear loading state if we are hydrated, avoiding the initial 'disconnected' flash on refresh
      if (isHydrated) {
        console.log('[useSiweAuth] Wallet truly disconnected. Clearing loading state.');
        if (authState.isLoading) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        console.log('[useSiweAuth] status is disconnected but not yet hydrated. Waiting for wagmi settle...');
      }
    } else {
      // status 'idle' or others
    }
  }, [address, status, restoreToken, authState.isAuthenticated, authState.isLoading, isHydrated]);

  return useMemo(
    () => ({
      ...authState,
      signIn,
      signOut,
      restoreToken,
    }),
    [authState, signIn, signOut, restoreToken]
  );
}
