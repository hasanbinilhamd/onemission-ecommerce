import { useMemo } from 'react';
import { LegalList, LegalPageLayout, LegalParagraph, LegalSection, usePageMetadata } from '../features/legal';

export function TermsPage() {
  const lastUpdated = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date());
  }, []);

  usePageMetadata({
    title: 'Terms & Conditions',
    description: 'Read the Terms & Conditions that guide how you shop, pay, ship, return, and interact with ONEMISSION.',
    path: '/terms',
  });

  return (
    <LegalPageLayout
      title="Terms & Conditions"
      subtitle="These terms explain how ONEMISSION serves customers with clarity, fairness, and respect across every order experience."
      lastUpdated={lastUpdated}
    >
      <LegalSection title="Welcome">
        <LegalParagraph>
          Welcome to ONEMISSION. Our platform is built to serve a modern, active Muslim lifestyle through performance apparel that stays aligned with faith, discipline, and purpose.
          By browsing or placing an order through ONEMISSION, you agree to the terms below.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Eligibility">
        <LegalParagraph>
          Customers are expected to provide accurate personal, delivery, and payment information when using our store. By placing an order, you confirm that the details you provide are complete, current, and authorised for use.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Products">
        <LegalParagraph>
          We work carefully to present each ONEMISSION product as clearly as possible. Even so, colours may appear slightly different depending on device screens, lighting, or production variations.
          Product images are representative, and customers should review available sizing information before completing a purchase.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Orders">
        <LegalParagraph>
          An order becomes confirmed after payment is successfully completed. Before payment is confirmed, checkout activity may remain pending, waiting, cancelled, or expire automatically according to the payment session status.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Payment">
        <LegalParagraph>
          Payments on ONEMISSION are processed securely through Midtrans. ONEMISSION does not store customer card details or sensitive payment credentials.
          All payment authorisation, validation, and settlement are handled through the approved payment provider.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Shipping">
        <LegalParagraph>
          Orders are shipped through available delivery partners within Indonesia. Delivery estimates are provided for convenience, but actual timelines may vary because of courier capacity, weather, regional access, public holidays, or other events outside our direct control.
          International shipping may be introduced in the future as our service expands.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Cancellation">
        <LegalParagraph>
          Unpaid orders may expire automatically when the payment window closes. Paid orders may be reviewed for cancellation before fulfillment begins.
          Once an order has been shipped, cancellation is no longer available. ONEMISSION and the HQ team reserve the right to review and decide cancellation requests according to the current order status.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Refund Policy">
        <LegalParagraph>
          Refund handling on ONEMISSION follows a structured review process to keep outcomes transparent and fair.
        </LegalParagraph>
        <LegalList
          items={[
            'A refund request is submitted by the customer or created through an approved operational process.',
            'The request is reviewed by the ONEMISSION HQ team.',
            'If approved, the refund enters the processing stage with the payment provider.',
            'If the provider confirms the transfer, the refund is completed.',
            'If the request does not meet policy, it may be rejected.',
          ]}
        />
        <LegalParagraph>
          Refund timing depends on the payment provider and banking systems involved. Even after approval, completion speed may vary outside ONEMISSION’s direct control.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Returns">
        <LegalParagraph>
          Returns are only accepted when a customer receives the wrong item, a damaged item, or a product with a manufacturing defect.
          Returns are not available for change-of-mind requests after shipment or for size selection errors made by the customer at checkout.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Intellectual Property">
        <LegalParagraph>
          All ONEMISSION brand assets remain the property of ONEMISSION, including logos, product imagery, videos, campaigns, written content, design elements, and original media published through our store or brand channels.
          These materials may not be copied, republished, or used commercially without written permission.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <LegalParagraph>
          ONEMISSION aims to provide accurate information, dependable service, and fair customer support. However, we are not responsible for indirect loss, interruption, courier delay, payment provider downtime, or outcomes caused by circumstances beyond our reasonable control.
          Our responsibility is limited to the value of the affected order where applicable under law.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Contact">
        <LegalParagraph>
          For questions about these terms, customers may contact the ONEMISSION support team at hello@onemissionclo.com.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}
