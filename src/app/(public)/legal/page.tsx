"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "terms", label: "Terms of Service" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "risk", label: "Risk Disclosure" },
];

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState("terms");

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 pb-8 lg:pt-32 lg:pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Legal Information
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Last updated: January 1, 2024
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-border sticky top-16 lg:top-20 bg-background z-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {activeTab === "terms" && <TermsContent />}
          {activeTab === "privacy" && <PrivacyContent />}
          {activeTab === "risk" && <RiskContent />}
        </div>
      </section>
    </>
  );
}

function TermsContent() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h2 className="font-heading text-2xl font-bold text-text-primary">Terms of Service</h2>
      
      <div className="mt-8 space-y-8 text-text-secondary">
        <section>
          <h3 className="text-lg font-semibold text-text-primary">1. Acceptance of Terms</h3>
          <p>
            By accessing or using the Standard Broker platform (&quot;Platform&quot;), you agree to be 
            bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, 
            you may not use the Platform.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">2. Eligibility</h3>
          <p>
            To use our Platform, you must be at least 18 years old and have the legal capacity 
            to enter into binding contracts. By using the Platform, you represent and warrant 
            that you meet these requirements.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">3. Account Registration</h3>
          <p>
            To access certain features of the Platform, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">4. Investment Services</h3>
          <p>
            Standard Broker provides investment management services. By using our services, 
            you acknowledge that:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>All investments carry risk, including the potential loss of principal</li>
            <li>Past performance is not indicative of future results</li>
            <li>We do not guarantee any specific returns or outcomes</li>
            <li>Investment decisions are ultimately your responsibility</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">5. Fees and Payments</h3>
          <p>
            Fees associated with our services are disclosed on the Platform. We reserve the 
            right to modify our fee structure with reasonable notice. You are responsible for 
            all applicable taxes related to your investments and withdrawals.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">6. Prohibited Activities</h3>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the Platform for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Platform</li>
            <li>Interfere with or disrupt the Platform&apos;s operation</li>
            <li>Use automated systems to access the Platform without permission</li>
            <li>Engage in money laundering or other financial crimes</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">7. Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, Standard Broker shall not be liable for 
            any indirect, incidental, special, consequential, or punitive damages arising 
            from your use of the Platform or our services.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">8. Modifications</h3>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of 
            material changes through the Platform or via email. Your continued use of the 
            Platform after such modifications constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">9. Contact</h3>
          <p>
            For questions about these Terms, please contact us at legal@standardbroker.com.
          </p>
        </section>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h2 className="font-heading text-2xl font-bold text-text-primary">Privacy Policy</h2>
      
      <div className="mt-8 space-y-8 text-text-secondary">
        <section>
          <h3 className="text-lg font-semibold text-text-primary">1. Information We Collect</h3>
          <p>We collect information you provide directly, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Personal identification information (name, email, phone number)</li>
            <li>Identity verification documents</li>
            <li>Financial information (bank accounts, payment methods)</li>
            <li>Transaction history and investment preferences</li>
          </ul>
          <p className="mt-4">We also automatically collect:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Device information and IP addresses</li>
            <li>Browser type and operating system</li>
            <li>Usage data and interaction with the Platform</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">2. How We Use Your Information</h3>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide and improve our services</li>
            <li>Process transactions and manage your account</li>
            <li>Verify your identity and prevent fraud</li>
            <li>Communicate with you about your account and services</li>
            <li>Comply with legal and regulatory requirements</li>
            <li>Analyze usage patterns to enhance user experience</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">3. Information Sharing</h3>
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Service providers who assist in our operations</li>
            <li>Financial institutions for payment processing</li>
            <li>Regulatory authorities as required by law</li>
            <li>Professional advisors (lawyers, accountants, auditors)</li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">4. Data Security</h3>
          <p>
            We implement industry-standard security measures to protect your information, 
            including encryption, secure servers, and regular security audits. However, 
            no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">5. Your Rights</h3>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to certain processing activities</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">6. Data Retention</h3>
          <p>
            We retain your information for as long as your account is active or as needed 
            to provide services. We may retain certain information as required by law or 
            for legitimate business purposes.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">7. Contact</h3>
          <p>
            For privacy-related inquiries, please contact our Data Protection Officer at 
            privacy@standardbroker.com.
          </p>
        </section>
      </div>
    </div>
  );
}

function RiskContent() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h2 className="font-heading text-2xl font-bold text-text-primary">Risk Disclosure</h2>
      
      <div className="mt-8 space-y-8 text-text-secondary">
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-6">
          <p className="font-medium text-text-primary">
            Important: Please read this risk disclosure carefully before investing.
          </p>
        </div>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">1. General Investment Risks</h3>
          <p>
            All investments carry inherent risks. The value of your investment can go down 
            as well as up, and you may receive less than you originally invested. Past 
            performance is not a reliable indicator of future results.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">2. Market Risk</h3>
          <p>
            Investment returns are subject to market conditions, which can be volatile and 
            unpredictable. Economic events, political developments, and other factors can 
            significantly impact investment performance.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">3. Liquidity Risk</h3>
          <p>
            Some investments may have limited liquidity, meaning they cannot be easily 
            converted to cash without potential loss of value. Investment terms and 
            withdrawal restrictions may apply.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">4. Cryptocurrency Risks</h3>
          <p>
            If you invest in cryptocurrency-related products, be aware of additional risks:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Extreme price volatility</li>
            <li>Regulatory uncertainty</li>
            <li>Technology and security risks</li>
            <li>Limited consumer protections</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">5. No Guarantees</h3>
          <p>
            Standard Broker does not guarantee any specific returns or investment outcomes. 
            Target returns mentioned on our Platform are based on historical performance 
            and market analysis, but actual results may vary significantly.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">6. Suitability</h3>
          <p>
            Before investing, you should carefully consider whether our investment products 
            are suitable for your financial situation, investment objectives, and risk 
            tolerance. We recommend consulting with an independent financial advisor.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">7. Only Invest What You Can Afford to Lose</h3>
          <p>
            You should only invest money that you can afford to lose without affecting your 
            standard of living. Do not invest emergency funds, retirement savings, or money 
            needed for essential expenses.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">8. Regulatory Status</h3>
          <p>
            Standard Broker operates in compliance with applicable laws and regulations. 
            However, investment products may not be covered by investor protection schemes 
            in all jurisdictions.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-text-primary">9. Acknowledgment</h3>
          <p>
            By using our Platform and investing through Standard Broker, you acknowledge 
            that you have read, understood, and accepted the risks described in this 
            disclosure. You confirm that you are making investment decisions based on 
            your own judgment and risk assessment.
          </p>
        </section>
      </div>
    </div>
  );
}
