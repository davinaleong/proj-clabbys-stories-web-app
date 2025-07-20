import dayjs from "dayjs"
import DATE_FORMATS from "./../db/date-formats"

export function formatDate(date, formatEnum = "EEE_DD_MMM_YYYY") {
  if (!date) return ""
  const selectedFormat = DATE_FORMATS[formatEnum] || DATE_FORMATS.EEE_D_MMM_YYYY
  const parsedDate = dayjs(date)
  return parsedDate.isValid() ? parsedDate.format(selectedFormat) : ""
}
