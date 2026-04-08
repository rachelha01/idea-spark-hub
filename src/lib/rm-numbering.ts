/**
 * Generate RM number: RM_MM_YYYY_NNN
 * Takes existing numbers for the same month/year to determine next sequence.
 */
export function generateRmNumber(existingNumbers: string[], date: Date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const prefix = `RM_${mm}_${yyyy}_`;

  let maxSeq = 0;
  for (const num of existingNumbers) {
    if (num?.startsWith(prefix)) {
      const seq = parseInt(num.slice(prefix.length), 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }

  return `${prefix}${String(maxSeq + 1).padStart(3, "0")}`;
}
