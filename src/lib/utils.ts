import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a user has admin role
 * @param roles - Array of user roles
 * @returns boolean indicating if user has admin role
 */
export function isAdmin(roles: string[]): boolean {
  return roles.includes("admin");
}
