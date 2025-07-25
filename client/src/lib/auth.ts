import { backendAPI, type BackendUser } from "./api";

const BACKEND_USER_KEY = "backend_user";

// Backend user management (main authentication system)
export function getCurrentBackendUser(): BackendUser | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(BACKEND_USER_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setCurrentBackendUser(user: BackendUser): void {
  localStorage.setItem(BACKEND_USER_KEY, JSON.stringify(user));
}

export function clearCurrentBackendUser(): void {
  localStorage.removeItem(BACKEND_USER_KEY);
  backendAPI.clearToken();
}

// Check if user is authenticated with backend
export function isBackendAuthenticated(): boolean {
  return !!backendAPI.getToken() && !!getCurrentBackendUser();
}

// Get current authenticated user
export function getCurrentUser(): BackendUser | null {
  return getCurrentBackendUser();
}

// Legacy compatibility functions
export function getAuthenticatedUser(): BackendUser | null {
  return getCurrentBackendUser();
}

export function clearCurrentUser(): void {
  clearCurrentBackendUser();
}
