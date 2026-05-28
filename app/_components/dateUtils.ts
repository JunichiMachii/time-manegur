// ローカルタイムゾーンで YYYY-MM-DD 文字列を返す。
// new Date().toISOString().slice(0,10) はUTC基準なので使わない。
export function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayLocal(): string {
  return formatDateLocal(new Date());
}

export function parseLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map((s) => parseInt(s, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isValidDateStr(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
