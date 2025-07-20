// lib/date-formatter.js
import dayjs from "dayjs"

// Example format: "ddd, DD MMM YYYY" => Sat, 20 Jul 2025
export function formatDate(dateString, format = "ddd, D MMM YYYY") {
  if (!dateString) return "" // safeguard
  return dayjs(dateString).format(format)
}
