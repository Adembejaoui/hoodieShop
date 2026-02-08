import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-6">
      <div className="prose dark:prose-invert max-w-none">
        <h1>Terms and Conditions</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement.
          </p>
        </section>

        <section>
          <h2>2. Use of Services</h2>
          <p>
            You agree to use our services only for lawful purposes and in accordance with these Terms and Conditions.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information. You are responsible for
            safeguarding your password and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2>4. Privacy Policy</h2>
          <p>
            Your use of our services is also governed by our Privacy Policy. By using our services, you consent to the
            collection and use of your information as described in our Privacy Policy.
          </p>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>
            All content, features, and functionality of this website are owned by us and are protected by international
            copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from
            your use of or inability to use the services.
          </p>
        </section>

        <section>
          <h2>7. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide
            notice prior to any new terms taking effect.
          </p>
        </section>

        <section>
          <h2>8. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us.
          </p>
        </section>

        <div className="mt-8">
          <Link href="/auth">
            <Button>Back to Registration</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
