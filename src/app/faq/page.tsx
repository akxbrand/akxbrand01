"use client";

import React, { useState } from "react";
import Image from "next/image";
import Layout from "@/components/layout/Layout";
import { Truck, CreditCard, RefreshCcw, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Clock, Globe, Phone, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  // FAQ Categories with their respective questions and answers
  const categories = [
    {
      id: "shipping",
      icon: <Truck className="w-8 h-8" />,
      title: "Shipping & Delivery",
      description: "Fast, reliable shipping worldwide",
      questions: [
        {
          question: "How long will it take to receive my order?",
          answer:
            "Standard shipping typically takes 3-5 business days within the continental US. Express shipping options are available for faster delivery.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Yes, we ship to most countries worldwide. International shipping times vary by location and typically take 7-14 business days.",
        },
        {
          question: "How can I track my order?",
          answer:
            "Once your order ships, you'll receive a tracking number via email that you can use to monitor your package's journey.",
        },
      ],
    },
    {
      id: "payment",
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Safe and encrypted transactions",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards (Visa, MasterCard, American Express), UPI, and Apple Pay.",
        },
        {
          question: "Are prices inclusive of tax?",
          answer:
            "Displayed prices do not include sales tax. Applicable taxes will be calculated at checkout based on your location.",
        },
        {
          question: "Do you offer price matching?",
          answer:
            "Yes, we offer price matching for identical items from authorized retailers. Contact our customer service for details.",
        },
      ],
    },
    {
      id: "returns",
      icon: <RefreshCcw className="w-8 h-8" />,
      title: "Easy Returns",
      description: "Hassle-free return process",
      questions: [],
    },
    {
      id: "product",
      icon: <HelpCircle className="w-8 h-8 text-gray-500" />,
      title: "Product Care",
      description: "Learn how to care maintain your products",
      questions: [],
    },
  ];

  const activeCategory = categories[0]; // Default to showing shipping questions

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="text-center py-8 md:py-12 px-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            How can we help you?
          </h1>
          <p className="text-gray-600">
            Find answers to frequently asked questions about our products and services
          </p>
        </div>

        {/* Category Icons */}
        <div className="container mx-auto px-4 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className="text-center cursor-pointer group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors duration-300">
                    {React.cloneElement(category.icon, {
                      className: "w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                    })}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-blue-700 transition-colors duration-300">
                  {category.title}
                </h3>
                <p className="text-base text-gray-600 group-hover:text-gray-800 transition-colors duration-300 leading-relaxed">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="container mx-auto px-4 md:px-4 max-w-4xl">
          {/* Shipping & Delivery Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Shipping & Delivery
            </h2>
            <div className="space-y-6">
              {categories[0].questions.map((qa, index) => {
                const [isOpen, setIsOpen] = useState(false);
                return (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full flex justify-between items-center py-3 md:py-4 text-left focus:outline-none"
                    >
                      <h3 className="text-base font-medium text-gray-900 pr-4">
                        {qa.question}
                      </h3>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="text-gray-600 pb-4 animate-fadeIn">
                        {qa.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Pricing Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Payment & Pricing
            </h2>
            <div className="space-y-6">
              {categories[1].questions.map((qa, index) => {
                const [isOpen, setIsOpen] = useState(false);
                return (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full flex justify-between items-center py-3 md:py-4 text-left focus:outline-none"
                    >
                      <h3 className="text-base font-medium text-gray-900 pr-4">
                        {qa.question}
                      </h3>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="text-gray-600 pb-4 animate-fadeIn">
                        {qa.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Still have questions section */}
          <div className="text-center py-8 md:py-12 border-t border-gray-200">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-8">
              Our customer support team is here to help
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto mb-12">
              {/* Live Chat */}
              <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors duration-300">
                    <MessageSquare className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600">Chat with our support team</p>
                <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300" onClick={()=>{console.log('hello world')}}>Start Chat</button>
              </div>
              <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors duration-300">
                    <Phone className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-xl">Phone Support</h3>
                <p className="text-gray-600 mb-4 text-base">Available Mon-Fri, 9am-6pm</p>
                <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-700 font-medium text-lg hover:underline transition-all duration-200">
                  +91 9034366104
                </a>
              </div>
              {/* Email */}
              <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors duration-300">
                    <Mail className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-xl">Email Support</h3>
                <p className="text-gray-600 mb-4 text-base">We'll respond within 24 hours</p>
                <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-700 font-medium text-lg hover:underline transition-all duration-200">
                  akxbrand@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
