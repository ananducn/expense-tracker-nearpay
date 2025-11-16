export function getMonthString(ym) {
  if (!ym) return "";

  const [year, month] = ym.split("-").map(Number);
  const date = new Date(year, month - 1);

  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}
