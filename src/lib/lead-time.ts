import { differenceInDays, parseISO } from "date-fns";

/**
 * Calculate lead time in days.
 * If endDate exists, returns diff between start and end.
 * If only startDate exists, returns diff between start and today.
 * Returns null if no startDate.
 */
export function calcLeadTime(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): number | null {
  if (!startDate) return null;
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : new Date();
  const days = differenceInDays(end, start);
  return days < 0 ? 0 : days;
}

export function formatLeadTime(days: number | null): string {
  if (days === null) return "-";
  return `${days} hari`;
}
