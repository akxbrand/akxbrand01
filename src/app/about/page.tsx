import React from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout/Layout";

const About = () => {
  return (
    <Layout>
      <div className="bg-white text-gray-800 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          {/* Our Story Section */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">About AKX Brand</h1>
            <p className="text-gray-600 max-w-2xl mx-auto px-4">
              We transform bedrooms into personal sanctuaries through our premium bedding collections.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-24 py-16">
            <div className="relative h-[400px]">
              <Image
                src="/images/brand-logo.png"
                alt="Modern bedroom"
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-semibold mb-6">Our Heritage</h2>
              <p className="text-gray-600 mb-4">
                With our expertise dating back to 2017, we've refined our craft and deepened our understanding of what truly makes exceptional bedding. This experience has given us invaluable insights into the quality standards and designs that best serve our customers' needs.
              </p>
              <p className="text-gray-600">
                Every AKX product is crafted with meticulous attention to detail, using carefully selected materials that ensure both comfort and durability. Our years of dedicated experience in the industry have allowed us to perfect our manufacturing processes, resulting in bedding that consistently exceeds expectations.
              </p>
            </div>
          </div>

          {/* Our Commitment Section */}
          <div className="mb-24">
            <h2 className="text-2xl font-semibold text-center mb-16">
              What Sets Us Apart
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="w-12 h-12 mx-auto text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-4">Exceptional Craftsmanship</h3>
                <p className="text-gray-600">
                  Backed by years of industry experience since 2017, ensuring the highest quality in every product.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="w-12 h-12 mx-auto text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-4">Premium Materials</h3>
                <p className="text-gray-600">
                  Thoughtfully sourced materials that feel indulgent against your skin, selected for both comfort and durability.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="w-12 h-12 mx-auto text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-4">Customer-Driven Excellence</h3>
                <p className="text-gray-600">
                  Designs refined through customer feedback and market trends, supported by responsive customer service.
                </p>
              </div>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gray-600">
              When you choose AKX Brand, you're benefiting from our established history of excellence. Since 2017, we've been dedicated to creating the perfect balance of comfort, quality, and style. Experience the difference that passionate dedication and years of expertise can make in your everyday life.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
