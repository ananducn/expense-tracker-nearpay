export default function getMonthString(date) {
  return date.toISOString().slice(0, 7); // YYYY-MM
}
