"use client"
import Image from "next/image"
import { env } from "./../lib/env"
import logo from "./../assets/logos/logo-midnight.png"

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pastel-pink-500">
      <section className="flex flex-col items-center w-full max-w-md px-6">
        <header>
          {/* Logo */}
          <div className="flex justify-center">
            <Image src={logo} alt="Logo" width={100} height={100} />
          </div>

          {/* App Name */}
          <h1 className="text-3xl text-center font-serif font-semibold text-carbon-blue-500 mb-6">
            {env.APP_NAME} – Privacy Policy
          </h1>
        </header>

        {/* Privacy Policy Content */}
        <article className="bg-neutral-100 rounded-lg p-6 shadow-md text-gray-800 text-sm space-y-4">
          <p>
            Your privacy is important to us. This Privacy Policy explains how{" "}
            <strong>{env.APP_NAME}</strong> handles your data and the measures
            we take to protect it.
          </p>

          <h2 className="text-lg font-semibold text-carbon-blue-500">
            1. Information We Collect
          </h2>
          <p>
            We only collect the information you provide during login, such as
            your email address and password (securely hashed). We do not collect
            any analytics or tracking data.
          </p>

          <h2 className="text-lg font-semibold text-carbon-blue-500">
            2. How We Use Cookies
          </h2>
          <p>
            We use a <strong>secure, essential cookie</strong> to maintain your
            login session. This cookie does not track your activity and is not
            shared with any third parties. No advertising or analytics cookies
            are used.
          </p>

          <h2 className="text-lg font-semibold text-carbon-blue-500">
            3. Data Security
          </h2>
          <p>
            Your authentication details are stored securely, and sensitive
            information such as passwords is hashed using industry-standard
            encryption. We never store plaintext passwords.
          </p>

          <h2 className="text-lg font-semibold text-carbon-blue-500">
            4. Third-Party Sharing
          </h2>
          <p>
            We do not sell, share, or distribute your data to any third parties.
          </p>

          <h2 className="text-lg font-semibold text-carbon-blue-500">
            5. Your Rights
          </h2>
          <p>
            You can request access or deletion of your account at any time by
            contacting us. For any privacy concerns, please reach out via our
            support email.
          </p>

          <p className="text-xs text-gray-600 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </article>

        {/* Back to Login */}
        <button
          onClick={() => history.back()}
          className="mt-6 text-carbon-blue-500 hover:underline text-sm"
        >
          ← Back
        </button>
      </section>
    </main>
  )
}
