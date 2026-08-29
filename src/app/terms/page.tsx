import type { Metadata } from "next";
import { PageShell } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of Elvate.",
};

const sections: { title: string; body: string }[] = [
  {
    title: "1. Acceptance of terms",
    body: "By accessing and using this website, you accept and agree to be bound by these terms. If you do not agree, please do not use the site or our services.",
  },
  {
    title: "2. Modifications",
    body: "We may modify these terms at any time. Changes take effect immediately upon posting on this page, and continued use of the service constitutes acceptance of those changes.",
  },
  {
    title: "3. User accounts",
    body: "You are responsible for keeping your account and password confidential and for restricting access to your account. You accept responsibility for all activity that occurs under it.",
  },
  {
    title: "4. Use of service",
    body: "You agree not to misuse the services or help anyone else do so. Misuse includes interfering with the services or accessing them by any method other than the interface and instructions we provide.",
  },
  {
    title: "5. Limitation of liability",
    body: "In no event shall Elvate, its directors, employees, partners, agents, suppliers or affiliates be liable for any indirect, incidental, special, consequential or punitive damages — including loss of profits, data, use, goodwill or other intangible losses — resulting from your use of or inability to use the service, or any unauthorised access to our servers or the personal information stored there.",
  },
  {
    title: "6. Governing law",
    body: "These terms are governed by and construed in accordance with the laws of Bangladesh, without regard to conflict-of-law provisions.",
  },
];

export default function TermsPage() {
  return (
    <PageShell
      width="md"
      title="Terms & Conditions"
      description="Please read these terms carefully before using our website or services."
    >
      <article className="grid max-w-prose gap-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-xl font-semibold">{s.title}</h2>
            <p className="leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
        <section>
          <h2 className="mb-2 text-xl font-semibold">7. Contact us</h2>
          <p className="leading-relaxed text-muted-foreground">
            If you have any questions about these terms, contact us at{" "}
            <a href="mailto:support@elvate.com" className="text-link hover:underline">
              support@elvate.com
            </a>
            .
          </p>
        </section>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Elvate. All rights reserved.
        </p>
      </article>
    </PageShell>
  );
}
