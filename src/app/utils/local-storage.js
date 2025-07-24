export function getFromLocalStorage(key, defaultValue = null) {
  if (typeof window === "undefined") return defaultValue // ✅ SSR safe

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue

    // ✅ Auto-parse JSON if it looks like JSON
    return raw.startsWith("{") || raw.startsWith("[") ? JSON.parse(raw) : raw
  } catch (err) {
    console.warn(`⚠️ Failed to read localStorage key: ${key}`, err)
    return defaultValue
  }
}

export function setToLocalStorage(key, value) {
  if (typeof window === "undefined") return

  try {
    const serialized =
      typeof value === "object" ? JSON.stringify(value) : String(value)
    localStorage.setItem(key, serialized)
  } catch (err) {
    console.warn(`⚠️ Failed to write localStorage key: ${key}`, err)
  }
}

export function removeFromLocalStorage(key) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key)
  }
}
