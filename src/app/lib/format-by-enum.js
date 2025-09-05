// ==============================
// ✅ Date formatting with fallback + enum support
// ==============================

export function formatByEnum(dateish, fmtEnum) {
  const d = Number.isFinite(+dateish)
    ? new Date(Number(dateish))
    : new Date(dateish)

  if (!fmtEnum) {
    // fallback long
    return new Intl.DateTimeFormat("en-SG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d)
  }

  switch (fmtEnum) {
    case "EEEE_D_MMM_YYYY":
      return new Intl.DateTimeFormat("en-SG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d)
    case "EEE_D_MMM_YYYY":
      return new Intl.DateTimeFormat("en-SG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d)
    case "D_MMM_YYYY":
      return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d)
    case "D_MMMM_YYYY":
      return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d)
    default:
      return new Intl.DateTimeFormat("en-SG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d)
  }
}
