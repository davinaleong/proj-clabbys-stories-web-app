import bcrypt from "bcryptjs"
import { env } from "./env.js"

/**
 * ✅ Validate plain text password against env.LOGIN_HASH
 * @param {string} inputPassword - The password user submits
 * @returns {Promise<boolean>} true if valid, false otherwise
 */
export async function validatePassword(inputPassword) {
  if (!env.LOGIN_HASH) {
    console.warn("⚠️ No LOGIN_HASH set in environment variables!")
    return false
  }

  // Compare user input with stored hash
  const isValid = await bcrypt.compare(inputPassword, env.LOGIN_HASH)
  return isValid
}
