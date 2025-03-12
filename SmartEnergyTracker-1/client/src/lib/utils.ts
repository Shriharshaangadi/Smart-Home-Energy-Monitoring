import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with commas and specified decimal places
 * 
 * @param value The number to format
 * @param decimals Number of decimal places to show
 * @param currency Whether to show as currency with dollar sign
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 2, currency = false): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: currency ? 'currency' : 'decimal',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value);
}
