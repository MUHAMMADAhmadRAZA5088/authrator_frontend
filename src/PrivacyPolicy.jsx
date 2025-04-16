import React from "react";
import { Link } from "react-router";
export default function PrivacyPolicy() {
  return (
    <div className="bg-gradient-to-b from-purple-900 to-purple-700 text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-purple-800 shadow-md">
        <div className="text-xl font-bold">
          <span className="text-purple-300">Auth</span>
          <span className="text-white">rator</span>
        </div>
      </header>

      {/* Privacy Policy Content */}
      <main className="container mx-auto py-16 px-6 md:px-12 flex-grow">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4">Last updated: April, 2025</p>

        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        <p className="mb-4">
          We collect personal information you provide directly, such as your name, email address, and usage data like IP addresses, browser type, and pages visited.
        </p>

        <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
        <p className="mb-4">
          Your data helps us improve our services, respond to your requests, and enhance your overall experience on our platform.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Sharing Your Information</h2>
        <p className="mb-4">
          We do not sell or rent your personal data. We share your data only with your consent, to comply with laws, or protect our rights.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
        <p className="mb-4">
          Our website uses cookies to enhance your experience. You can manage cookie preferences through your browser settings.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Third-Party Websites</h2>
        <p className="mb-4">
          We are not responsible for the privacy practices of external sites linked from our website. Please review their policies separately.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
        <p className="mb-4">
          We may update this policy occasionally. We encourage periodic review for the latest information on our privacy practices.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at {" "}
          <a href="mailto:support@authrator.com" className="underline">
            support@authrator.com
          </a>
          .
        </p>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-purple-900 text-center">
      <p>&copy; {new Date().getFullYear()} Authrator. All rights reserved. | <Link to="/privacy-policy" className="underline">Privacy Policy</Link> | <Link to="/terms-of-service" className="underline">Terms of Service</Link></p>
      </footer>
    </div>
  );
}