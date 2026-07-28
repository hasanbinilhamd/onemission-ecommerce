import { useMemo } from 'react';
import { LegalList, LegalPageLayout, LegalParagraph, LegalSection, usePageMetadata } from '../features/legal';

export function PrivacyPage() {
  const lastUpdated = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date());
  }, []);

  usePageMetadata({
    title: 'Privacy Policy',
    description: 'Learn how ONEMISSION collects, uses, protects, and manages customer information across our ecommerce experience.',
    path: '/privacy',
  });

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="We protect customer information with care so every ONEMISSION experience remains secure, respectful, and transparent."
      lastUpdated={lastUpdated}
    >
      <LegalSection title="Information We Collect">
        <LegalParagraph>
          To operate our store responsibly, ONEMISSION may collect the information needed to support shopping, shipping, and customer service.
        </LegalParagraph>
        <LegalList
          items={[
            'Name, email address, phone number, and shipping address',
            'Order history and purchase activity',
            'Basic device and browser information used to improve store performance',
            'Cookies and similar technologies that help us understand store usage',
          ]}
        />
      </LegalSection>

      <LegalSection title="How We Use Information">
        <LegalParagraph>
          We use customer information to fulfill orders, communicate order updates, provide support, coordinate shipping, improve the experience of our store, prevent fraud, and send marketing or brand updates where appropriate.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Payment Information">
        <LegalParagraph>
          Payment credentials are processed securely by Midtrans. ONEMISSION does not store customer card numbers, CVV details, or other sensitive payment credentials.
          Payment processing, verification, and transaction security are handled through the approved payment provider.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Cookies">
        <LegalParagraph>
          Cookies help us remember preferences, support core website functions, understand how visitors use the store, and improve speed and usability.
          Customers may manage cookie preferences through their browser settings, although some features may work differently if cookies are disabled.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Third Party Services">
        <LegalParagraph>
          ONEMISSION works with trusted third parties where needed to operate the business responsibly. These may include Midtrans for payment processing, shipping partners for delivery, analytics tools for performance insight, and future service integrations that help improve store operations.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Data Security">
        <LegalParagraph>
          We apply reasonable technical and organisational measures to protect customer information from unauthorised access, misuse, or disclosure.
          While no online system can promise absolute security, ONEMISSION is committed to using modern protection practices and secure service providers wherever possible.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Customer Rights">
        <LegalParagraph>
          Customers may request access to their information, ask us to update inaccurate details, or request deletion where legally and operationally appropriate.
          Some information may need to be retained to complete transactions, meet accounting obligations, resolve disputes, or comply with applicable law.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Contact">
        <LegalParagraph>
          Privacy questions or data requests may be directed to the ONEMISSION support team at hello@onemissionclo.com.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}
