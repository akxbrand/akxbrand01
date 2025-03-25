import React from 'react';
import Layout from '@/components/layout/Layout';

// Metadata for SEO
export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn about how we protect your privacy and handle your personal information.',
  keywords: 'privacy policy, data protection, customer privacy, secure shopping'
};

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <section className="relative py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
              <p className="text-lg text-gray-600">
                Your privacy is important to us. Learn how we collect, use, and protect your personal information.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Introduction</h2>
              <p className="text-gray-600 mb-4">
                This Privacy Policy describes how AKXBrand (the "Site", "we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from www.akxbrand.com (the "Site") or otherwise communicate with us (collectively, the "Services"). For purposes of this Privacy Policy, "you" and "your" means you as the user of the Services, whether you are a customer, website visitor, or another individual whose information we have collected pursuant to this Privacy Policy.
              </p>
              <p className="text-gray-600 mb-4">
                Please read this Privacy Policy carefully. By using and accessing any of the Services, you agree to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree to this Privacy Policy, please do not use or access any of the Services.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Changes to This Privacy Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on the Site, update the "Last updated" date and take any other steps required by applicable law.
              </p>
            </section>

            {/* Information Collection and Use */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">How We Collect and Use Your Personal Information</h2>
              <p className="text-gray-600 mb-4">
                To provide the Services, we collect and have collected over the past 12 months personal information about you from a variety of sources. The information that we collect and use varies depending on how you interact with us.
              </p>
              <p className="text-gray-600 mb-4">
                In addition to the specific uses set out below, we may use information we collect about you to communicate with you, provide the Services, comply with any applicable legal obligations, enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others.
              </p>
            </section>

            {/* What Personal Information We Collect */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">What Personal Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                The types of personal information we obtain about you depends on how you interact with our Site and use our Services. When we use the term "personal information", we are referring to information that identifies, relates to, describes or can be associated with you.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Information We Collect Directly from You</h3>
                  <p className="text-gray-600 mb-4">Information that you directly submit to us through our Services may include:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Basic contact details including your name, address, phone number, email</li>
                    <li>Order information including your name, billing address, shipping address, payment confirmation, email address, phone number</li>
                    <li>Account information including your username, password, security questions</li>
                    <li>Shopping information including the items you view, put in your cart or add to your wishlist</li>
                    <li>Customer support information including the information you choose to include in communications with us</li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-600 mt-4">
                Some features of the Services may require you to directly provide us with certain information about yourself. You may elect not to provide this information, but doing so may prevent you from using or accessing these features.
              </p>
            </section>

            {/* Cookie Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Information We Collect through Cookies</h2>
              <p className="text-gray-600 mb-4">
                Like many websites, we use Cookies on our Site. For specific information about the Cookies that we use related to powering our store with Vercel, see https://vercel.com/legal/cookie-policy. We use Cookies to power and improve our Site and our Services (including to remember your actions and preferences), to run analytics and better understand user interaction with the Services (in our legitimate interests to administer, improve and optimize the Services). We may also permit third parties and services providers to use Cookies on our Site to better tailor the services, products and advertising on our Site and other websites.
              </p>
              <p className="text-gray-600 mb-4">
                Most browsers automatically accept Cookies by default, but you can choose to set your browser to remove or reject Cookies through your browser controls. Please keep in mind that removing or blocking Cookies can negatively impact your user experience and may cause some of the Services, including certain features and general functionality, to work incorrectly or no longer be available. Additionally, blocking Cookies may not completely prevent how we share information with third parties such as our advertising partners.
              </p>
            </section>

            {/* Third Party Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Information We Obtain from Third Parties</h2>
              <p className="text-gray-600 mb-4">
                We may obtain information about you from third parties, including from vendors and service providers who may collect information on our behalf, such as:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Companies who support our Site and Services, such as Vercel</li>
                <li>Our payment processors, who collect payment information to process your payment and fulfill your orders</li>
                <li>Third parties we work with when you interact with our Services or advertisements</li>
              </ul>
              <p className="text-gray-600 mb-4">
                Any information we obtain from third parties will be treated in accordance with this Privacy Policy. We are not responsible or liable for the accuracy of the information provided to us by third parties and are not responsible for any third party's policies or practices.
              </p>
            </section>

            {/* How We Use Personal Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">How We Use Your Personal Information</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Providing Products and Services: Process payments, fulfill orders, send notifications, manage your account, and arrange shipping</li>
                <li>Marketing and Advertising: Send promotional communications and show you advertisements for products or services</li>
                <li>Security and Fraud Prevention: Detect, investigate or take action regarding possible fraudulent, illegal or malicious activity</li>
                <li>Communicating with you: Provide customer support and improve our Services</li>
              </ul>
            </section>

            {/* How We Disclose Personal Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">How We Disclose Personal Information</h2>
              <p className="text-gray-600 mb-4">
                In certain circumstances, we may disclose your personal information to third parties for legitimate purposes subject to this Privacy Policy. Such circumstances may include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>With vendors or other third parties who perform services on our behalf (e.g., IT management, payment processing, data analytics, customer support, cloud storage, fulfillment and shipping).</li>
                <li>With business and marketing partners, including Shopify, to provide services and advertise to you. Our business and marketing partners will use your information in accordance with their own privacy notices.</li>
                <li>When you direct, request us or otherwise consent to our disclosure of certain information to third parties, such as to ship you products or through your use of social media widgets or login integrations, with your consent.</li>
                <li>With our affiliates or otherwise within our corporate group, in our legitimate interests to run a successful business.</li>
                <li>In connection with a business transaction such as a merger or bankruptcy, to comply with any applicable legal obligations (including to respond to subpoenas, search warrants and similar requests), to enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others.</li>
              </ul>
              <p className="text-gray-600 mb-4">
                We have, in the past 12 months disclosed the following categories of personal information and sensitive personal information (denoted by *) about users for the purposes set out above in "How we Collect and Use your Personal Information" and "How we Disclose Personal Information":
              </p>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-gray-600"><strong>Categories:</strong></p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Identifiers such as basic contact details and certain order and account information</li>
                  <li>Commercial information such as order information, shopping information and customer support information</li>
                  <li>Internet or other similar network activity, such as Usage Data</li>
                </ul>
                <p className="text-gray-600 mt-4"><strong>Categories of Recipients:</strong></p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Vendors and third parties who perform services on our behalf (such as Internet service providers, payment processors, fulfillment partners, customer support partners and data analytics providers)</li>
                  <li>Business and marketing partners</li>
                  <li>Affiliates</li>
                </ul>
              </div>
              <p className="text-gray-600 mt-4">
                We do not use or disclose sensitive personal information for the purposes of inferring characteristics about you.
              </p>
            </section>

            {/* User Generated Content */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">User Generated Content</h2>
              <p className="text-gray-600 mb-4">
                The Services may enable you to post product reviews and other user-generated content. If you choose to submit user generated content to any public area of the Services, this content will be public and accessible by anyone.
              </p>
              <p className="text-gray-600 mb-4">
                We do not control who will have access to the information that you choose to make available to others, and cannot ensure that parties who have access to such information will respect your privacy or keep it secure. We are not responsible for the privacy or security of any information that you make publicly available, or for the accuracy, use or misuse of any information that you disclose or receive from third parties.
              </p>
            </section>

            {/* Third Party Websites */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Third Party Websites and Links</h2>
              <p className="text-gray-600 mb-4">
                Our Site may provide links to websites or other online platforms operated by third parties. If you follow links to sites not affiliated or controlled by us, you should review their privacy and security policies and other terms and conditions. We do not guarantee and are not responsible for the privacy or security of such sites, including the accuracy, completeness, or reliability of information found on these sites. Information you provide on public or semi-public venues, including information you share on third-party social networking platforms may also be viewable by other users of the Services and/or users of those third-party platforms without limitation as to its use by us or by a third party. Our inclusion of such links does not, by itself, imply any endorsement of the content on such platforms or of their owners or operators, except as disclosed on the Services.
              </p>
            </section>

            {/* Children's Data */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Children's Data</h2>
              <p className="text-gray-600 mb-4">
                The Services are not intended to be used by children, and we do not knowingly collect any personal information about children. If you are the parent or guardian of a child who has provided us with their personal information, you may contact us using the contact details set out below to request that it be deleted.
              </p>
              <p className="text-gray-600 mb-4">
                As of the Effective Date of this Privacy Policy, we do not have actual knowledge that we "share" or "sell" (as those terms are defined in applicable law) personal information of individuals under 16 years of age.
              </p>
            </section>

            {/* Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Security and Retention of Your Information</h2>
              <p className="text-gray-600 mb-4">
                We implement physical, electronic, and managerial procedures to protect your information from unauthorized access or disclosure. We take the security of your personal information seriously and use appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing and against accidental loss, destruction or damage.
              </p>
              <p className="text-gray-600 mb-4">
                Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee "perfect security." In addition, any information you send to us may not be secure while in transit. We recommend that you do not use unsecure channels to communicate sensitive or confidential information to us.
              </p>
              <p className="text-gray-600 mb-4">
                How long we retain your personal information depends on different factors, such as whether we need the information to maintain your account, to provide the Services, comply with legal obligations, resolve disputes or enforce other applicable contracts and policies.
              </p>
            </section>

            {/* Exercising Your Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Exercising Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You may exercise any of these rights where indicated on our Site or by contacting us using the contact details provided below - 9034366104. We will not discriminate against you for exercising any of these rights.
              </p>
              <p className="text-gray-600 mb-4">
                We may need to collect information from you to verify your identity, such as your email address or account information, before providing a substantive response to the request. In accordance with applicable laws, You may designate an authorized agent to make requests on your behalf to exercise your rights. Before accepting such a request from an agent, we will require that the agent provide proof you have authorized them to act on your behalf, and we may need you to verify your identity directly with us. We will respond to your request in a timely manner as required under applicable law.
              </p>
            </section>

            {/* Complaints */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Complaints</h2>
              <p className="text-gray-600 mb-4">
                If you have complaints about how we process your personal information, please contact us using the contact details provided below. If you are not satisfied with our response to your complaint, depending on where you live you may have the right to appeal our decision by contacting us using the contact details set out below, or lodge your complaint with your local data protection authority.
              </p>
            </section>

            {/* International Users */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">International Users</h2>
              <p className="text-gray-600 mb-4">
                Please note that we may transfer, store and process your personal information outside the country you live in, including the United States. Your personal information is also processed by staff and third party service providers and partners in these countries.
              </p>
              <p className="text-gray-600 mb-4">
                If we transfer your personal information out of Europe, we will rely on recognized transfer mechanisms like the European Commission's Standard Contractual Clauses, or any equivalent contracts issued by the relevant competent authority of the UK, as relevant, unless the data transfer is to a country that has been determined to provide an adequate level of protection.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Contact</h2>
              <p className="text-gray-600 mb-4">
                Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, please call at +91-9034366104 or email us at akxbrand@gmail.com or contact us at 33/10 Matta Chowk, Panipat.
              </p>
            </section>

            {/* Your Rights and Choices */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Your Rights and Choices</h2>
              <p className="text-gray-600 mb-4">
                Depending on where you live, you may have some or all of the rights listed below in relation to your personal information. However, these rights are not absolute, may apply only in certain circumstances and, in certain cases, we may decline your request as permitted by law.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Right to Access / Know: You may have a right to request access to personal information that we hold about you, including details relating to the ways in which we use and share your information.</li>
                  <li>Right to Delete: You may have a right to request that we delete personal information we maintain about you.</li>
                  <li>Right to Correct: You may have a right to request that we correct inaccurate personal information we maintain about you.</li>
                  <li>Right of Portability: You may have a right to receive a copy of the personal information we hold about you and to request that we transfer it to a third party, in certain circumstances and with certain exceptions.</li>
                  <li>Restriction of Processing: You may have the right to ask us to stop or restrict our processing of personal information.</li>
                  <li>Withdrawal of Consent: Where we rely on consent to process your personal information, you may have the right to withdraw this consent.</li>
                  <li>Appeal: You may have a right to appeal our decision if we decline to process your request. You can do so by replying directly to our denial.</li>
                </ul>
              </div>
              <p className="text-gray-600 mt-4">
                We may send you promotional emails, and you may opt out of receiving these at any time by using the unsubscribe option displayed in our emails to you. If you opt out, we may still send you non-promotional emails, such as those about your account or orders that you have made.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
