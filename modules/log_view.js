export function getVisibleLog(entries, { isMobile, max } = {}) {
  const list = Array.isArray(entries) ? entries : [];
  if (!isMobile) return list;
  const cap = Number(max);
  if (!Number.isFinite(cap) || cap <= 0) return list;
  if (list.length <= cap) return list;
  return list.slice(list.length - cap);
}
