"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-25 font-sans">
      <div className="max-w-3xl w-full bg-neutral-900 rounded-2xl shadow-xl border border-neutral-800 p-8">
        <h1 className="text-4xl font-bold mb-5 text-blue-500 text-center">
          Terms & Conditions
        </h1>
        <p className="mb-8 text-neutral-300 text-center">
          Please read these terms and conditions ("terms", "terms and
          conditions") carefully before using our website or services.
        </p>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-400">
            1. Acceptance of Terms
          </h2>
          <p className="text-neutral-200">
            By accessing and using this website, you accept and agree to be
            bound by the terms and provision of this agreement. If you do not
            agree to abide by the above, please do not use this site or our
            services.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-400">
            2. Modifications
          </h2>
          <p className="text-neutral-200">
            We reserve the right to modify these terms at any time. Any changes
            will be effective immediately upon posting on this page. Your
            continued use of the service constitutes acceptance of those
            changes.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-400">
            3. User Accounts
          </h2>
          <p className="text-neutral-200">
            You are responsible for maintaining the confidentiality of your
            account and password and for restricting access to your account. You
            agree to accept responsibility for all activities that occur under
            your account.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-400">
            4. Use of Service
          </h2>
          <p className="text-neutral-200">
            You agree not to misuse the services or help anyone else do so.
            Misuse includes, but is not limited to, interfering with the
            services or accessing them using a method other than the interface
            and instructions we provide.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-400">
            5. Limitation of Liability
          </h2>
          <p className="text-neutral-200">
            In no event shall we, nor our directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from (i) your use or inability to use
            the service; (ii) any unauthorized access to or use of our servers
            and/or any personal information stored therein.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-400">
            6. Governing Law
          </h2>
          <p className="text-neutral-200">
            These terms shall be governed and construed in accordance with the
            laws of your country, without regard to its conflict of law
            provisions.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-400">
            7. Contact Us
          </h2>
          <p className="text-neutral-200">
            If you have any questions about these Terms, please contact us at{" "}
            <span className="text-blue-400">support@yourdomain.com</span>.
          </p>
        </section>
        <div className="text-neutral-500 text-xs mt-8 text-center">
          &copy; {new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </div>
    </div>
  );
}
