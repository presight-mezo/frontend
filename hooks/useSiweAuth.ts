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
    if (typeof window !== 'undefined') {
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
    if (typeof window !== 'undefined') {
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

  // Automatically attempt to restore token on initialization when address settles
  useEffect(() => {
    // If wagmi is still initializing, wait
    if (status === 'connecting' || status === 'reconnecting') return;

    if (address && !authState.isAuthenticated) {
      restoreToken();
    } else if (status === 'disconnected') {
      // If no wallet is connected, we're definitely done loading auth
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [address, status, restoreToken, authState.isAuthenticated]);

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
