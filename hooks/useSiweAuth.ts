'use client';

import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
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
  const { address } = useAccount();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
  });

  /**
   * Get SIWE message from user signature
   */
  const signIn = useCallback(
    async (signer: any) => {
      if (!address) {
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
        const message = new SiweMessage({
          domain: window.location.host,
          address,
          statement: 'Sign in to Presight Prediction Market',
          uri: window.location.origin,
          version: '1',
          chainId: 31611, // Mezo Testnet
          nonce: Math.random().toString(36).substring(7),
          issuedAt: new Date().toISOString(),
        });

        const messageStr = message.prepareMessage();
        const signature = await signer.signMessage({ message: messageStr });

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
    return null;
  }, [address]);

  return {
    ...authState,
    signIn,
    signOut,
    restoreToken,
  };
}
