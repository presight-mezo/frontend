'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { getWebSocketInstance, type PresightWebSocket } from '@/lib/websocket';
import { useSiweAuth } from '@/hooks/useSiweAuth';

interface ApiContextType {
  isAuthenticated: boolean;
  token?: string;
  isLoading: boolean;
  error?: string;
  address?: string;
  ws?: PresightWebSocket;
  signIn: (signer: any) => Promise<string | void>;
  signOut: () => void;
  restoreSession: () => boolean;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function PresightApiProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const auth = useSiweAuth();
  const [ws, setWs] = useState<PresightWebSocket | undefined>();
  const [sessionRestored, setSessionRestored] = useState(false);

  /**
   * Restore authentication session on mount
   */
  useEffect(() => {
    if (!sessionRestored && isConnected && address) {
      const token = auth.restoreToken();
      if (token) {
        console.log('Session restored from storage');
        setSessionRestored(true);
      }
    }
  }, [isConnected, address, auth.restoreToken, sessionRestored]);

  /**
   * Initialize WebSocket connection when authenticated
   */
  useEffect(() => {
    if (auth.isAuthenticated && !ws) {
      const wsInstance = getWebSocketInstance();
      
      wsInstance.connect()
        .then(() => {
          console.log('WebSocket connected');
          setWs(wsInstance);
        })
        .catch((error) => {
          console.error('Failed to connect WebSocket:', error);
        });

      return () => {
        // Don't disconnect on unmount - keep connection alive
        // wsInstance.disconnect();
      };
    }
  }, [auth.isAuthenticated]);

  /**
   * Handle sign in with message signing
   */
  const handleSignIn = useCallback(async () => {
    try {
      return await auth.signIn();
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  }, [auth]);

  /**
   * Handle sign out
   */
  const handleSignOut = useCallback(() => {
    auth.signOut();
    const wsInstance = getWebSocketInstance();
    if (wsInstance.isConnected()) {
      wsInstance.disconnect();
    }
    setWs(undefined);
  }, [auth]);

  const value: ApiContextType = {
    isAuthenticated: auth.isAuthenticated,
    token: auth.token,
    isLoading: auth.isLoading,
    error: auth.error,
    address: auth.address || address,
    ws,
    signIn: handleSignIn,
    signOut: handleSignOut,
    restoreSession: () => !!auth.restoreToken(),
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

/**
 * Hook to use API context
 */
export function usePresightApi(): ApiContextType {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('usePresightApi must be used within PresightApiProvider');
  }
  return context;
}
