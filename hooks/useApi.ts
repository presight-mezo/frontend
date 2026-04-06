'use client';

import { useCallback, useState, useEffect } from 'react';
import {
  groupApi,
  marketApi,
  stakeApi,
  mandateApi,
  yieldApi,
  resolverApi,
  troveApi,
  profileApi,
} from '@/lib/api';

/**
 * Generic hook for API calls with loading and error states
 */
function useApiCall<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<{ data?: T; error?: string; status: number }>,
  immediate = false
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunction(...args);
        if (result.error) {
          setError(result.error);
          return { data: null, error: result.error };
        }
        setData(result.data || null);
        return { data: result.data, error: null };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return { data: null, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
}

/**
 * Hook for group operations
 */
export function useGroups(token?: string) {
  const createGroup = useApiCall(
    (data: { name: string; description?: string }) =>
      groupApi.create(token || '', data),
    false
  );

  const joinGroup = useApiCall(
    (groupId: string) => groupApi.join(token || '', groupId),
    false
  );

  const getGroup = useApiCall(
    (groupId: string) => groupApi.getGroup(groupId),
    false
  );

  const getLeaderboard = useApiCall(
    (groupId: string) => groupApi.getLeaderboard(groupId),
    false
  );

  const listGroups = useApiCall(() => groupApi.list(), false);

  return {
    createGroup,
    joinGroup,
    getGroup,
    getLeaderboard,
    listGroups,
  };
}

/**
 * Hook for market operations
 */
export function useMarkets(token?: string) {
  const createMarket = useApiCall(
    (data: {
      groupId: string;
      question: string;
      description?: string;
      endTime: number;
      stakeMode: 'full-stake' | 'zero-risk';
      poolA?: string;
      poolB?: string;
    }) => marketApi.create(token || '', data),
    false
  );

  const getMarket = useApiCall(
    (marketId: string) => marketApi.getMarket(marketId),
    false
  );

  const listMarkets = useApiCall(
    (groupId?: string) => marketApi.list(groupId),
    false
  );

  return {
    createMarket,
    getMarket,
    listMarkets,
  };
}

/**
 * Hook for stake operations
 */
export function useStakes(token?: string) {
  const placeStake = useApiCall(
    (data: { marketId: string; outcome: 'YES' | 'NO'; amount: string }) =>
      stakeApi.place(token || '', data),
    false
  );

  const getStakes = useApiCall(
    (marketId: string) => stakeApi.list(marketId),
    false
  );

  return {
    placeStake,
    getStakes,
  };
}

/**
 * Hook for mandate operations
 */
export function useMandate(token?: string) {
  const setMandate = useApiCall(
    (data: { limitPerMarket: string }) =>
      mandateApi.set(token || '', data),
    false
  );

  const getMandate = useApiCall(
    () => mandateApi.get(token || ''),
    false
  );

  const revokeMandate = useApiCall(
    () => mandateApi.revoke(token || ''),
    false
  );

  return {
    setMandate,
    getMandate,
    revokeMandate,
  };
}

/**
 * Hook for yield operations
 */
export function useYield(token?: string) {
  const getAccruedYield = useApiCall(
    () => yieldApi.getAccrued(token || ''),
    false
  );

  return {
    getAccruedYield,
  };
}

/**
 * Hook for resolver operations
 */
export function useResolver(token?: string) {
  const getNotifications = useApiCall(
    () => resolverApi.getNotifications(token || ''),
    false
  );

  const resolveMarket = useApiCall(
    (marketId: string, data: { outcome: 'YES' | 'NO' }) =>
      resolverApi.resolve(token || '', marketId, data),
    false
  );

  return {
    getNotifications,
    resolveMarket,
  };
}

/**
 * Hook for trove operations
 */
export function useTrove(token?: string) {
  const getTrove = useApiCall(() => troveApi.get(token || ''), false);

  useEffect(() => {
    if (token) {
      getTrove.execute();
    }
  }, [token]);

  return {
    ...getTrove,
    isLoading: getTrove.loading,
  };
}

/**
 * Hook for profile operations
 */
export function useProfile(token?: string) {
  const getProfile = useApiCall(() => profileApi.get(token || ''), false);
  const onboardProfile = useApiCall(
    (data: { defaultRiskMode: 'zero-risk' | 'full-stake' }) =>
      profileApi.onboard(token || '', data),
    false
  );

  return {
    getProfile,
    onboardProfile,
  };
}
