import type { User } from "@shared/schema";
import { backendAPI, type BackendUser } from "./api";

const USER_KEY = "anonymous_user";
const BACKEND_USER_KEY = "backend_user";

// Legacy support for existing anonymous users
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(BACKEND_USER_KEY);
  backendAPI.clearToken();
}

// New backend user management
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

// Get any authenticated user (legacy or backend)
export function getAuthenticatedUser(): User | BackendUser | null {
  const backendUser = getCurrentBackendUser();
  if (backendUser && backendAPI.getToken()) {
    return backendUser;
  }
  
  return getCurrentUser();
}
