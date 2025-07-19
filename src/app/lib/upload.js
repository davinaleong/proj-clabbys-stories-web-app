import { env } from "./env"

/**
 * ✅ Helper: Build FormData for single or multiple files
 */
function buildFormData(files, fieldName = "file") {
  const formData = new FormData()

  if (Array.isArray(files)) {
    files.forEach((file) => formData.append("files", file)) // multi
  } else {
    formData.append(fieldName, files) // single
  }

  return formData
}

/**
 * ✅ Upload a single file to the REST API
 * @param {File|Blob} file
 * @returns {Promise<object>} Cloudinary upload result
 */
export async function uploadSingle(file) {
  if (!file) throw new Error("No file provided")

  const formData = buildFormData(file, "file")

  const res = await fetch(env.UPLOAD_URL, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Single upload failed")
  }

  return res.json()
}

/**
 * ✅ Upload multiple files to the REST API
 * @param {File[]|Blob[]} files
 * @returns {Promise<object>} Array of Cloudinary results
 */
export async function uploadMultiple(files) {
  if (!files || files.length === 0) throw new Error("No files provided")

  const formData = buildFormData(files, "files")

  const res = await fetch(`${env.UPLOAD_URL}/multi`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Multi-upload failed")
  }

  return res.json()
}
