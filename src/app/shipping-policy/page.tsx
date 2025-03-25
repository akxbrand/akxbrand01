import React from 'react';
import Layout from '@/components/layout/Layout';

// Metadata for SEO
export const metadata = {
  title: 'Shipping Policy',
  description: 'Learn about our shipping methods, delivery times, and costs.',
  keywords: 'shipping policy, delivery, shipping methods, shipping costs'
};

export default function ShippingPolicy() {
  return (
    <Layout>
      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <section className="relative py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">Shipping Policy</h1>
              <p className="text-lg text-gray-600">
                Fast and reliable shipping for your satisfaction.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Order Processing */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Order Processing</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-gray-600">
                  At our company, we take pride in our fast and reliable shipping process. Orders will be processed and shipped within 24 hours of payment confirmation.
                </p>
              </div>
            </section>

            {/* Delivery Times */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Delivery Times</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>We ship via standard ground shipping</li>
                  <li>Typical delivery time is 3-5 business days</li>
                  <li>Delivery times may vary depending on the shipping address and other factors</li>
                  <li>If we are unable to ship within 72 hours, we will notify you immediately with an estimated shipping date</li>
                </ul>
              </div>
            </section>

            {/* Product Care */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Product Care & Handling</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>We take great care in packaging and handling your products</li>
                  <li>All items are carefully inspected before shipping</li>
                  <li>If you receive damaged or defective products, please contact us within 24 hours of delivery</li>
                  <li>We will arrange for return or exchange of damaged items</li>
                </ul>
              </div>
            </section>

            {/* Customer Support */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Customer Support</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-gray-600">
                  If you have any questions about your order, please do not hesitate to contact us. We are here to help!
                </p>
                <p className="text-gray-600">
                  Thank you for choosing our company for your shipping needs. We look forward to providing you with excellent service and speedy delivery!
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
