"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import ClientLayout from "../components/ClientLayout";

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");

    // Simulate form submission
    setTimeout(() => {
      setFormStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset form status after 3 seconds
      setTimeout(() => {
        setFormStatus("idle");
      }, 3000);
    }, 1500);
  };

  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Image
              src="/logo.svg"
              alt="Pukapuka Logo"
              width={150}
              height={60}
              className="w-[150px] sm:w-[200px] h-auto"
              priority
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
            Have a question or need assistance? We&apos;re here to help! Reach
            out to our friendly team through any of the methods below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Information */}
          <div className="order-2 md:order-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Get in Touch
            </h2>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start">
                <Mail
                  className="text-indigo-600 mr-3 sm:mr-4 flex-shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <h3 className="text-base sm:text-lg font-medium">Email Us</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    info@pukapuka.com
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    support@pukapuka.com
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone
                  className="text-indigo-600 mr-3 sm:mr-4 flex-shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <h3 className="text-base sm:text-lg font-medium">Call Us</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    +1 (555) 123-4567
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    +1 (555) 987-6543
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin
                  className="text-indigo-600 mr-3 sm:mr-4 flex-shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <h3 className="text-base sm:text-lg font-medium">Visit Us</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    123 Book Street
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    Literary District, NY 10001
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock
                  className="text-indigo-600 mr-3 sm:mr-4 flex-shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <h3 className="text-base sm:text-lg font-medium">
                    Business Hours
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Monday - Friday: 9am - 6pm
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    Saturday: 10am - 4pm
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Connect With Us
              </h2>
              <div className="flex flex-wrap gap-3">
                {/* Social Media Icons - with better responsive styling */}
                {["facebook", "instagram", "twitter", "youtube"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="bg-indigo-100 text-indigo-600 p-2.5 sm:p-3 rounded-full hover:bg-indigo-200 transition transform hover:scale-105"
                      aria-label={`Visit our ${social} page`}
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {/* SVG paths remain the same */}
                      </svg>
                    </a>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-5 sm:p-8 rounded-lg shadow-md order-1 md:order-2">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Send Us a Message
            </h2>

            <p className="mb-4 sm:mb-6 text-sm sm:text-base">
              We&apos;d love to hear from you! Fill out the form below...
            </p>

            {formStatus === "success" ? (
              <div className="bg-green-50 border border-green-100 rounded-md p-4 sm:p-6 text-center">
                <CheckCircle
                  className="mx-auto text-green-500 mb-2 sm:mb-3"
                  size={40}
                />
                <h3 className="text-lg sm:text-xl font-medium text-green-800 mb-1">
                  Message Sent!
                </h3>
                <p className="text-sm sm:text-base text-green-600">
                  Thank you for reaching out. We&apos;ll get back to you
                  shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Support">Order Support</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Return/Exchange">Return/Exchange</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={formStatus === "submitting"}
                  className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 px-4 text-sm sm:text-base rounded-md hover:bg-indigo-700 transition flex items-center justify-center"
                >
                  {formStatus === "submitting" ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Find Us
          </h2>
          <div className="bg-gray-200 h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <p>Map will be displayed here</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                What are your shipping rates?
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                We offer free shipping on orders over $50. For orders under $50,
                shipping costs are calculated based on location and order
                weight.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                How can I track my order?
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Once your order ships, you&apos;ll receive a tracking number via
                email that you can use to monitor your delivery status.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                What is your return policy?
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                We accept returns within 30 days of delivery. Items must be in
                original condition with tags attached.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                Do you ship internationally?
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Yes, we ship to most countries worldwide. International shipping
                rates and delivery times vary by location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
