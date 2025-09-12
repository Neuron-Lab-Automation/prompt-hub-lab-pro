import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function calculateCTR(copies: number, visits: number): number {
  if (visits === 0) return 0;
  return (copies / visits) * 100;
}

export function estimateTokens(text: string): number {
  // Simple estimation: ~4 characters per token for most languages
  return Math.ceil(text.length / 4);
}

export function calculateTokenCost(
  inputTokens: number,
  outputTokens: number,
  model: { input_cost: number; output_cost: number }
): number {
  const inputCost = (inputTokens / 1000000) * model.input_cost;
  const outputCost = (outputTokens / 1000000) * model.output_cost;
  return inputCost + outputCost;
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
}