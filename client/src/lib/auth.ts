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

// Logout with backend API call
export async function logoutUser(): Promise<void> {
  try {
    await backendAPI.logout();
  } catch (error) {
    console.error('Backend logout failed, but clearing local session:', error);
  }
  // Always clear local data regardless of backend response
  clearCurrentBackendUser();
}

// Check if user is authenticated with backend
export function isBackendAuthenticated(): boolean {
  return !!backendAPI.getToken() && !!getCurrentBackendUser();
}

// Get current authenticated user
export function getCurrentUser(): BackendUser | null {
  return getCurrentBackendUser();
}

// Initialize user session by fetching current user from backend
export async function initializeUserSession(): Promise<BackendUser | null> {
  if (!isBackendAuthenticated()) {
    return null;
  }
  
  try {
    const user = await backendAPI.getCurrentUser();
    setCurrentBackendUser(user);
    return user;
  } catch (error) {
    console.error('Failed to initialize user session:', error);
    // Clear invalid session
    clearCurrentBackendUser();
    return null;
  }
}

// Legacy compatibility functions
export function getAuthenticatedUser(): BackendUser | null {
  return getCurrentBackendUser();
}

export function clearCurrentUser(): void {
  clearCurrentBackendUser();
}
