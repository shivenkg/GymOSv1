/**
 * GymOS API Client
 * Provides centralized HTTP request handling, JWT token management,
 * and base URL routing.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'gymos_auth_token';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Restore session token if available in sessionStorage
    try {
      this.token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch {
      this.token = null;
    }
  }

  public setToken(token: string | null, persist = false): void {
    this.token = token;
    try {
      if (token) {
        if (persist) {
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          sessionStorage.setItem(TOKEN_KEY, token);
        }
      } else {
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore storage unavailability
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null; status: number }> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const status = response.status;
      let json: any = null;

      try {
        json = await response.json();
      } catch {
        json = null;
      }

      if (!response.ok) {
        if (status === 401) {
          // Token is expired or invalid
          this.setToken(null);
        }
        const errorMsg = json?.error || `Request failed with status ${status}`;
        return { data: null, error: errorMsg, status };
      }

      return { data: json as T, error: null, status };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || 'Network error occurred while connecting to the GymOS server.',
        status: 0,
      };
    }
  }

  public get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  public async checkHealth(): Promise<{ healthy: boolean; databaseConnected: boolean; latencyMs?: number }> {
    try {
      const res = await fetch('/health');
      if (!res.ok) return { healthy: false, databaseConnected: false };
      const data = await res.json();
      return {
        healthy: data?.status === 'UP',
        databaseConnected: data?.database?.connected === true,
        latencyMs: data?.database?.latencyMs,
      };
    } catch {
      return { healthy: false, databaseConnected: false };
    }
  }
}

export const apiClient = new ApiClient();
