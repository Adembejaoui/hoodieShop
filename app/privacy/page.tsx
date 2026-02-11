import { Metadata } from 'next';
import { Shield, Eye, Lock, Mail, User, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Hoodie Legends',
  description: 'Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-16 w-16 text-purple-400 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            How we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-white/60 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Table of Contents */}
          <div className="mb-12 p-6 bg-secondary/30 rounded-xl border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Table of Contents
            </h2>
            <nav className="space-y-2 text-sm">
              <a href="#introduction" className="block text-muted-foreground hover:text-foreground transition-colors">
                1. Introduction
              </a>
              <a href="#data-we-collect" className="block text-muted-foreground hover:text-foreground transition-colors">
                2. Data We Collect
              </a>
              <a href="#how-we-use" className="block text-muted-foreground hover:text-foreground transition-colors">
                3. How We Use Your Data
              </a>
              <a href="#cookies" className="block text-muted-foreground hover:text-foreground transition-colors">
                4. Cookies & Tracking
              </a>
              <a href="#sharing" className="block text-muted-foreground hover:text-foreground transition-colors">
                5. Data Sharing
              </a>
              <a href="#data-rights" className="block text-muted-foreground hover:text-foreground transition-colors">
                6. Your Rights
              </a>
              <a href="#security" className="block text-muted-foreground hover:text-foreground transition-colors">
                7. Data Security
              </a>
              <a href="#children" className="block text-muted-foreground hover:text-foreground transition-colors">
                8. Children's Privacy
              </a>
              <a href="#changes" className="block text-muted-foreground hover:text-foreground transition-colors">
                9. Policy Changes
              </a>
              <a href="#contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                10. Contact Us
              </a>
            </nav>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {/* Introduction */}
            <div id="introduction" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">1.</span> Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Hoodie Legends ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you visit our website 
                and make purchases from us. Please read this privacy policy carefully. If you do not agree with the 
                terms of this privacy policy, please do not access the site.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                This policy complies with the General Data Protection Regulation (GDPR) and other applicable 
                data protection laws.
              </p>
            </div>

            {/* Data We Collect */}
            <div id="data-we-collect" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">2.</span> Data We Collect
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-400" />
                    Personal Data
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Name and surname</li>
                    <li>• Email address</li>
                    <li>• Phone number</li>
                    <li>• Billing and shipping address</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-400" />
                    Usage Data
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• IP address</li>
                    <li>• Browser type and version</li>
                    <li>• Pages visited</li>
                    <li>• Time spent on pages</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Your Data */}
            <div id="how-we-use" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">3.</span> How We Use Your Data
              </h2>
              <p className="text-muted-foreground mb-4">
                We use your personal data for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li>Processing and fulfilling your orders</li>
                <li>Managing your account and providing customer support</li>
                <li>Sending order confirmations and updates</li>
                <li>Improving our website and services</li>
                <li>Personalizing your shopping experience</li>
                <li>Marketing communications (with your consent)</li>
                <li>Complying with legal obligations</li>
                <li>Preventing fraud and ensuring security</li>
              </ul>
            </div>

            {/* Cookies & Tracking */}
            <div id="cookies" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">4.</span> Cookies & Tracking
              </h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to track activity on our website and hold certain information.
              </p>
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">Types of Cookies We Use</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-white">Necessary Cookies:</span>
                      <p className="text-muted-foreground">Required for the website to function properly. These cannot be disabled.</p>
                    </div>
                    <div>
                      <span className="font-medium text-white">Analytics Cookies:</span>
                      <p className="text-muted-foreground">Help us understand how visitors interact with our website.</p>
                    </div>
                    <div>
                      <span className="font-medium text-white">Marketing Cookies:</span>
                      <p className="text-muted-foreground">Used to track visitors across websites for ad targeting.</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can manage your cookie preferences at any time using our Cookie Consent Banner or 
                  by adjusting your browser settings.
                </p>
              </div>
            </div>

            {/* Data Sharing */}
            <div id="sharing" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">5.</span> Data Sharing
              </h2>
              <p className="text-muted-foreground mb-4">
                We do not sell your personal data. We may share your data with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
                <li><strong>Service Providers:</strong> Third-party companies that perform services on our behalf</li>
                <li><strong>Payment Processors:</strong> For secure payment processing</li>
                <li><strong>Shipping Partners:</strong> For order delivery</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div id="data-rights" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">6.</span> Your Rights
              </h2>
              <p className="text-muted-foreground mb-4">
                Under GDPR, you have the following rights regarding your personal data:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <Lock className="h-5 w-5 text-purple-400 mb-2" />
                  <h3 className="font-semibold">Right to Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Request a copy of the personal data we hold about you.
                  </p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <FileText className="h-5 w-5 text-purple-400 mb-2" />
                  <h3 className="font-semibold">Right to Rectification</h3>
                  <p className="text-sm text-muted-foreground">
                    Request correction of inaccurate or incomplete data.
                  </p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <Shield className="h-5 w-5 text-purple-400 mb-2" />
                  <h3 className="font-semibold">Right to Erasure</h3>
                  <p className="text-sm text-muted-foreground">
                    Request deletion of your personal data ("right to be forgotten").
                  </p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <Eye className="h-5 w-5 text-purple-400 mb-2" />
                  <h3 className="font-semibold">Right to Portability</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive your data in a machine-readable format.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                To exercise any of these rights, please visit our {' '}
                <a href="/data-export" className="text-purple-400 hover:text-purple-300 underline">
                  Data Export
                </a>
                {' '} or {' '}
                <a href="/data-deletion" className="text-purple-400 hover:text-purple-300 underline">
                  Data Deletion
                </a>
                {' '} pages.
              </p>
            </div>

            {/* Data Security */}
            <div id="security" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">7.</span> Data Security
              </h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures to protect your 
                personal data against unauthorized access, alteration, disclosure, or destruction. This 
                includes SSL encryption, secure databases, and regular security audits. However, no method 
                of transmission over the internet is 100% secure.
              </p>
            </div>

            {/* Children's Privacy */}
            <div id="children" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">8.</span> Children's Privacy
              </h2>
              <p className="text-muted-foreground">
                Our website is not intended for children under 16 years of age. We do not knowingly 
                collect personal data from children under 16. If you are a parent or guardian and believe 
                your child has provided us with personal data, please contact us immediately.
              </p>
            </div>

            {/* Policy Changes */}
            <div id="changes" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">9.</span> Policy Changes
              </h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            {/* Contact Us */}
            <div id="contact" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">10.</span> Contact Us
              </h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="p-4 bg-secondary/30 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Hoodie Legends</h3>
                    <p className="text-sm text-muted-foreground">support@hoodielegends.com</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      For GDPR requests, please include "GDPR Request" in the subject line.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
