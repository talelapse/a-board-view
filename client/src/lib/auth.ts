import type { User } from "@shared/schema";

const USER_KEY = "anonymous_user";

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
}
