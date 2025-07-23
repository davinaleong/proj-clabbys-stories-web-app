export const env = {
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || "development",
  GQL_API_URL:
    process.env.NEXT_PUBLIC_GQL_API_URL || "http://localhost:4000/graphql",
  REST_API_URL:
    process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:4000/api/",
  APP_SETTINGS_UUID: process.env.NEXT_PUBLIC_APP_SETTINGS_UUID || "",
}

// ✅ Optional helper to check required vars
export function validateEnv() {
  const missing = Object.entries(env)
    .filter(([key, val]) => !val)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.warn(
      `⚠️ Missing required env vars: ${missing.join(", ")}\n` +
        `Check your .env file!`
    )
  }
}
