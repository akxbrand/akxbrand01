import React from 'react';
import Layout from '@/components/layout/Layout';

// Metadata for SEO
export const metadata = {
  title: 'Return and Refund Policy',
  description: 'Learn about our return and refund policies, including eligibility, process, and timeframes.',
  keywords: 'return policy, refund policy, returns, refunds, exchanges'
};

export default function ReturnPolicy() {
  return (
    <Layout>
      <div className="bg-white text-gray-800">
        <section className="relative py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">Return and Refund Policy</h1>
              <p className="text-lg text-gray-600">
                Please read our return and refund guidelines carefully.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">What You Can Return/Exchange</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <ul className="list-disc list-inside text-gray-600">
                  <li>Unused, unwashed, undamaged, and in saleable condition products with all tags and original packaging intact</li>
                  <li>Complete sets must be returned (e.g., comforters, cushion covers and pillowcases must be returned together)</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Time Limits</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Damage/Wrong Product: Report within 24 hours with photos & unboxing video</li>
                  <li>Unboxing Video Mandatory: Proof required for damage or wrong product claims</li>
                  <li>Return/Exchange Request: Initiate within 48 hours of delivery</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">What We Don't Accept</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Correct Orders: Products that match your order exactly cannot be returned</li>
                  <li>Late Requests: Returns outside the timeframes will not be processed</li>
                  <li>Used/Damaged Products: Products damaged due to user mishandling or altered value are non-returnable</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">How to Initiate a Return</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <ul className="list-disc list-inside text-gray-600">
                  <li>Contact us within 48 hours of delivery</li>
                  <li>For any additional information connect with us on WhatsApp +919034366104 or email</li>
                  <li>Provide photos of the packed product within the same working day of the return request</li>
                  <li>Without images, return requests will not be accepted</li>
                  <li>Provide photos and an unboxing video for damage/wrong product claims</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Refunds</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <ul className="list-disc list-inside text-gray-600">
                  <li>Approved returns will be refunded, excluding shipping costs</li>
                  <li>We reserve the right to reject returns that don't meet these conditions</li>
                  <li>Only one return and exchange request will be entertained per order</li>
                  <li>By placing an order with us, you agree to these terms and conditions</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
