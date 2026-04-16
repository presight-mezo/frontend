'use client';

import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
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

  const apiFunctionRef = useRef(apiFunction);
  useEffect(() => {
    apiFunctionRef.current = apiFunction;
  }, [apiFunction]);

  const execute = useCallback(
    async (...args: P) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunctionRef.current(...args);
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
    []
  );

  return { data, loading, error, execute };
}

/**
 * Hook for group operations
 */
export function useGroups(token?: string) {
  const createGroup = useApiCall(
    useCallback(
      (data: { name: string; description?: string; isPrivate?: boolean }) =>
        groupApi.create(token || "", data),
      [token]
    ),
    false
  );

  const joinGroup = useApiCall(
    useCallback((groupId: string) => groupApi.join(token || "", groupId), [token]),
    false
  );

  const leaveGroup = useApiCall(
    useCallback((groupId: string) => groupApi.leave(token || "", groupId), [token]),
    false
  );

  const kickMember = useApiCall(
    useCallback((groupId: string, address: string) => groupApi.kickMember(token || "", groupId, address), [token]),
    false
  );

  const updateGroup = useApiCall(
    useCallback((groupId: string, data: { name?: string; description?: string; isPrivate?: boolean }) => groupApi.updateGroup(token || "", groupId, data), [token]),
    false
  );

  const deleteGroup = useApiCall(
    useCallback((groupId: string) => groupApi.deleteGroup(token || "", groupId), [token]),
    false
  );

  const getGroup = useApiCall(
    useCallback((groupId: string) => groupApi.getGroup(groupId), []),
    false
  );

  const getLeaderboard = useApiCall(
    useCallback((groupId: string) => groupApi.getLeaderboard(groupId), []),
    false
  );

  const listGroups = useApiCall(
    useCallback(() => groupApi.list(token || ""), [token]),
    false
  );

  return useMemo(
    () => ({
      createGroup,
      joinGroup,
      leaveGroup,
      kickMember,
      updateGroup,
      deleteGroup,
      getGroup,
      getLeaderboard,
      listGroups,
    }),
    [createGroup, joinGroup, leaveGroup, kickMember, updateGroup, deleteGroup, getGroup, getLeaderboard, listGroups]
  );
}

/**
 * Hook for market operations
 */
export function useMarkets(token?: string) {
  const createMarket = useApiCall(
    useCallback(
      (data: {
        groupId: string;
        question: string;
        deadline: string;           // ISO date string — matches backend
        mode: 'full-stake' | 'zero-risk'; // matches backend field name
        resolverAddress: string;
      }) => marketApi.create(token || '', data),
      [token]
    ),
    false
  );

  const getMarket = useApiCall(
    useCallback((marketId: string) => marketApi.getMarket(marketId), []),
    false
  );

  const listMarkets = useApiCall(
    useCallback((groupId?: string) => marketApi.list(groupId), []),
    false
  );

  return useMemo(
    () => ({
      createMarket,
      getMarket,
      listMarkets,
    }),
    [createMarket, getMarket, listMarkets]
  );
}

/**
 * Hook for stake operations
 */
export function useStakes(token?: string) {
  const placeStake = useApiCall(
    useCallback(
      (data: { marketId: string; direction: 'YES' | 'NO'; amount: string }) =>
        stakeApi.place(token || '', data),
      [token]
    ),
    false
  );

  const getStakes = useApiCall(
    useCallback((marketId: string) => stakeApi.list(marketId), []),
    false
  );

  return useMemo(
    () => ({
      placeStake,
      getStakes,
    }),
    [placeStake, getStakes]
  );
}

/**
 * Hook for mandate operations
 */
export function useMandate(token?: string) {
  const setMandate = useApiCall(
    useCallback(
      (data: { limitPerMarket: string }) => mandateApi.set(token || "", data),
      [token]
    ),
    false
  );

  const getMandate = useApiCall(
    useCallback(() => mandateApi.get(token || ""), [token]),
    false
  );

  const revokeMandate = useApiCall(
    useCallback(() => mandateApi.revoke(token || ""), [token]),
    false
  );

  return useMemo(
    () => ({
      setMandate,
      getMandate,
      revokeMandate,
    }),
    [setMandate, getMandate, revokeMandate]
  );
}

/**
 * Hook for yield operations
 */
export function useYield(token?: string) {
  const getAccruedYield = useApiCall(
    useCallback(() => yieldApi.getAccrued(token || ""), [token]),
    false
  );

  return useMemo(
    () => ({
      getAccruedYield,
    }),
    [getAccruedYield]
  );
}

/**
 * Hook for resolver operations
 */
export function useResolver(token?: string) {
  const getNotifications = useApiCall(
    useCallback(() => resolverApi.getNotifications(token || ""), [token]),
    false
  );

  const resolveMarket = useApiCall(
    useCallback(
      (marketId: string, data: { outcome: "YES" | "NO" }) =>
        resolverApi.resolve(token || "", marketId, data),
      [token]
    ),
    false
  );

  return useMemo(
    () => ({
      getNotifications,
      resolveMarket,
    }),
    [getNotifications, resolveMarket]
  );
}

/**
 * Hook for trove operations
 */
export function useTrove(token?: string) {
  const getTrove = useApiCall(
    useCallback(() => troveApi.get(token || ""), [token]),
    false
  );

  useEffect(() => {
    if (token) {
      getTrove.execute();
    }
  }, [token]);

  return useMemo(
    () => ({
      ...getTrove,
      isLoading: getTrove.loading,
    }),
    [getTrove]
  );
}

/**
 * Hook for profile operations
 */
export function useProfile(token?: string) {
  const getProfile = useApiCall(
    useCallback(() => profileApi.get(token || ""), [token]),
    false
  );
  const onboardProfile = useApiCall(
    useCallback(
      (data: { defaultRiskMode: "zero-risk" | "full-stake" }) =>
        profileApi.onboard(token || "", data),
      [token]
    ),
    false
  );
  const updateProfile = useApiCall(
    useCallback(
      (data: { username?: string; bio?: string; avatarUrl?: string; twitter?: string; defaultRiskMode?: string }) =>
        profileApi.update(token || "", data),
      [token]
    ),
    false
  );

  const getGlobalProfile = useApiCall(
    useCallback((address: string) => profileApi.getGlobal(address), []),
    false
  );

  const getLeaderboard = useApiCall(
    useCallback(() => profileApi.getLeaderboard(), []),
    false
  );

  return useMemo(
    () => ({
      getProfile,
      onboardProfile,
      updateProfile,
      getGlobalProfile,
      getLeaderboard,
    }),
    [getProfile, onboardProfile, updateProfile, getGlobalProfile, getLeaderboard]
  );
}
