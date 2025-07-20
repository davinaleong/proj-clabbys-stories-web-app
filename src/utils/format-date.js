import dayjs from "dayjs"

export const DATE_FORMATS = {
  EEE_DD_MMM_YYYY: "ddd, D MMM YYYY", // Sun, 20 Jul 2025
  EEEE_DD_MMM_YYYY: "dddd, D MMM YYYY", // Sunday, 20 Jul 2025
  EEEE_DD_MMMM_YYYY: "dddd, D MMMM YYYY", // Sunday, 20 July 2025
  DD_MMM_YYYY: "D MMM YYYY", // 20 Jul 2025
  DD_MMMM_YYYY: "D MMMM YYYY", // 20 July 2025
  DD_MMM: "D MMM", // 20 Jul
  DD_MMMM: "D MMMM", // 20 July
}

export function formatDate(date, formatEnum = "EEE_DD_MMM_YYYY") {
  if (!date) return ""
  const selectedFormat =
    DATE_FORMATS[formatEnum] || DATE_FORMATS.EEE_DD_MMM_YYYY
  const parsedDate = dayjs(date)
  return parsedDate.isValid() ? parsedDate.format(selectedFormat) : ""
}
