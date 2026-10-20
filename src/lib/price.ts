import type { PriceType } from './types/database';

/**
 * Formats a price in paise (cents) to Indian Rupee string representation.
 * Example: 7250000 -> "₹72,500"
 * Example starting_from: 850000 -> "From ₹8,500"
 * Example on_request: "Price on Request"
 */
export function formatINR(priceCents: number, priceType: PriceType = 'fixed'): string {
  if (priceType === 'on_request') {
    return 'Price on Request';
  }

  const rupees = Math.round(priceCents / 100);
  const formattedRupees = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);

  if (priceType === 'starting_from') {
    return `From ${formattedRupees}`;
  }

  return formattedRupees;
}

/**
 * Parses raw rupee string or number into price_cents (integer paise) and price_type.
 * Handles inputs like:
 * - "₹72,500" -> { price_cents: 7250000, price_type: 'fixed' }
 * - "From ₹8,500" -> { price_cents: 850000, price_type: 'starting_from' }
 * - "Price on Request" -> { price_cents: 10000, price_type: 'on_request' }
 * - 4850 -> { price_cents: 485000, price_type: 'fixed' }
 */
export function parseINRToCents(raw: string | number): {
  price_cents: number;
  price_type: PriceType;
} {
  if (typeof raw === 'number') {
    return {
      price_cents: Math.round(raw * 100),
      price_type: 'fixed',
    };
  }

  const str = raw.trim();
  const lower = str.toLowerCase();

  let priceType: PriceType = 'fixed';
  if (lower.includes('on request') || lower.includes('on-request')) {
    return { price_cents: 100, price_type: 'on_request' };
  }

  if (lower.startsWith('from')) {
    priceType = 'starting_from';
  }

  // Strip everything except digits and dot
  const numericStr = str.replace(/[^0-9.]/g, '');
  const parsedFloat = parseFloat(numericStr);

  if (isNaN(parsedFloat) || parsedFloat <= 0) {
    return { price_cents: 100, price_type: priceType };
  }

  return {
    price_cents: Math.round(parsedFloat * 100),
    price_type: priceType,
  };
}

/**
 * Converts price in paise (cents) to clean rupee number for form inputs.
 * Example: 7250000 -> 72500
 */
export function centsToRupees(priceCents: number): number {
  return Math.round(priceCents / 100);
}

/**
 * Converts rupee number from form input to paise (cents).
 * Example: 72500 -> 7250000
 */
export function rupeesToCents(rupees: number): number {
  return Math.round(rupees * 100);
}
