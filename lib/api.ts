/**
 * API Client for Presight Backend
 * Handles all API requests with SIWE authentication
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Make authenticated API request with Bearer token (SIWE)
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: any;
    headers?: Record<string, string>;
    token?: string;
  } = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        error: responseData.error || responseData.message || "Request failed",
        status: response.status,
      };
    }

    return {
      data: responseData,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network request failed",
      status: 500,
    };
  }
}

/**
 * Encode SIWE signature and message as Bearer token
 */
export function encodeSignatureAsToken(
  message: string,
  signature: string
): string {
  const combined = `${message}|${signature}`;
  return Buffer.from(combined).toString("base64");
}

/**
 * Group API endpoints
 */
export const groupApi = {
  create: (token: string, data: { name: string; description?: string }) =>
    apiRequest("/api/v1/groups", {
      method: "POST",
      body: data,
      token,
    }),

  getGroup: (groupId: string) =>
    apiRequest(`/api/v1/groups/${groupId}`),

  join: (token: string, groupId: string) =>
    apiRequest(`/api/v1/groups/${groupId}/join`, {
      method: "POST",
      token,
    }),

  getLeaderboard: (groupId: string) =>
    apiRequest(`/api/v1/groups/${groupId}/leaderboard`),

  list: () => apiRequest("/api/v1/groups"),
};

/**
 * Market API endpoints
 */
export const marketApi = {
  create: (
    token: string,
    data: {
      groupId: string;
      question: string;
      description?: string;
      endTime: number;
      stakeMode: "full-stake" | "zero-risk";
      poolA?: string;
      poolB?: string;
    }
  ) =>
    apiRequest("/api/v1/markets", {
      method: "POST",
      body: data,
      token,
    }),

  getMarket: (marketId: string) =>
    apiRequest(`/api/v1/markets/${marketId}`),

  list: (groupId?: string) => {
    const query = groupId ? `?groupId=${groupId}` : "";
    return apiRequest(`/api/v1/markets${query}`);
  },
};

/**
 * Stake API endpoints
 */
export const stakeApi = {
  place: (
    token: string,
    data: {
      marketId: string;
      outcome: "YES" | "NO";
      amount: string;
    }
  ) =>
    apiRequest("/api/v1/stakes", {
      method: "POST",
      body: data,
      token,
    }),

  list: (marketId: string) =>
    apiRequest(`/api/v1/stakes?marketId=${marketId}`),
};

/**
 * Mandate API endpoints
 */
export const mandateApi = {
  set: (token: string, data: { limitPerMarket: string }) =>
    apiRequest("/api/v1/mandate", {
      method: "POST",
      body: data,
      token,
    }),

  get: (token: string) =>
    apiRequest("/api/v1/mandate", {
      token,
    }),

  revoke: (token: string) =>
    apiRequest("/api/v1/mandate", {
      method: "DELETE",
      token,
    }),
};

/**
 * Profile API endpoints
 */
export const profileApi = {
  get: (token: string) =>
    apiRequest("/api/v1/profile", {
      token,
    }),
};

/**
 * Yield API endpoints
 */
export const yieldApi = {
  getAccrued: (token: string) =>
    apiRequest("/api/v1/yield/accrued", {
      token,
    }),
};

/**
 * Resolver API endpoints
 */
export const resolverApi = {
  getNotifications: (token: string) =>
    apiRequest("/api/v1/resolver/notifications", {
      token,
    }),

  resolve: (token: string, marketId: string, data: { outcome: "YES" | "NO" }) =>
    apiRequest(`/api/v1/resolver/${marketId}/resolve`, {
      method: "POST",
      body: data,
      token,
    }),
};

/**
 * Health check
 */
export const healthCheck = () => apiRequest("/health");
