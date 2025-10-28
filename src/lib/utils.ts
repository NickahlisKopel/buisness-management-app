import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `ORD-${timestamp}-${random}`.toUpperCase()
}

export function calculateOrderTotal(items: Array<{ quantity: number; unitPrice: number }>): number {
  return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// Address helpers
export function normalizeStateCode(state: string | null | undefined): string | null {
  if (!state) return null
  const s = state.trim()
  if (!s) return null
  return s.toUpperCase()
}

export function isValidStateCode(state: string | null | undefined): boolean {
  if (!state) return false
  const s = state.trim().toUpperCase()
  return /^[A-Z]{2}$/.test(s)
}

export function isValidZipCode(zip: string | null | undefined): boolean {
  if (!zip) return false
  const z = String(zip).trim()
  return /^\d{5}(?:-\d{4})?$/.test(z)
}
