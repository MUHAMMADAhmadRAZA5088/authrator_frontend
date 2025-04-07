import React from "react";
import { Link } from "react-router";

const TermsOfService = () => {
  return (
    <div className="bg-gradient-to-b from-purple-900 to-purple-700 text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-purple-800 shadow-md">
        <div className="text-xl font-bold">
          <span className="text-purple-300">Auth</span>
          <span className="text-white">rator</span>
        </div>
      </header>

      {/* Terms of Service Content */}
      <section className="container mx-auto py-16 px-6 md:px-12 flex-grow">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="mb-4">Last updated: April, 2025</p>

        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">Welcome to Authrator. By accessing or using our services, you agree to comply with these Terms of Service. Please read them carefully.</p>

        <h2 className="text-2xl font-semibold mb-4">Using Our Services</h2>
        <p className="mb-4">You may use our services only as permitted by law. Do not misuse our services by interfering with their normal operation or accessing them using methods other than the interface provided.</p>

        <h2 className="text-2xl font-semibold mb-4">Account Responsibilities</h2>
        <p className="mb-4">You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

        <h2 className="text-2xl font-semibold mb-4">Content Ownership</h2>
        <p className="mb-4">All content provided through our services, including text, graphics, and software, remains the intellectual property of Authrator. Unauthorized use of any content is prohibited.</p>

        <h2 className="text-2xl font-semibold mb-4">Termination of Access</h2>
        <p className="mb-4">We may suspend or terminate your access to our services if you violate these Terms of Service or engage in activities that disrupt the functionality of our platform.</p>

        <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
        <p className="mb-4">Our services are provided on an "as-is" basis. We disclaim all warranties, express or implied, including but not limited to the accuracy or reliability of the services.</p>

        <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
        <p className="mb-4">In no event shall Authrator be liable for any damages arising from your use of our services, including direct, indirect, incidental, or consequential damages.</p>

        <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>
        <p className="mb-4">We reserve the right to update these Terms of Service at any time. Continued use of our services after changes take effect constitutes acceptance of the new terms.</p>

        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p>
          If you have any questions regarding these Terms of Service, please contact us at {" "}
          <a href="mailto:support@authrator.com" className="underline">
            support@authrator.com
          </a>
          .
        </p>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-purple-900 text-center">
      <p>&copy; {new Date().getFullYear()} Authrator. All rights reserved. | <Link to="/privacy-policy" className="underline">Privacy Policy</Link> | <Link to="/terms-of-service" className="underline">Terms of Service</Link></p>
      </footer>
    </div>
  );
};

export default TermsOfService;
