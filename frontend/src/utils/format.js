export function formatMoney(amount) {
  const n = Number(amount || 0);
  return "\u20A6" + n.toLocaleString("en-NG");
}

export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
