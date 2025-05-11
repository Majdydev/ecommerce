import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users, Globe, Mail } from "lucide-react";
import ClientLayout from "../components/ClientLayout";

export default function AboutPage() {
  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.svg"
              alt="Pukapuka Logo"
              width={200}
              height={80}
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Pukapuka
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your premier destination for books of all genres. We're passionate
            about literature and dedicated to bringing the best reading
            experience to our customers.
          </p>
        </div>

        {/* Our Story Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Story</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-700 mb-4">
                Founded in 2020, Pukapuka began with a simple mission: to make
                quality books accessible to everyone. What started as a small
                online bookstore has now grown into a comprehensive literary
                platform serving readers worldwide.
              </p>
              <p className="text-gray-700 mb-4">
                Our team consists of passionate bibliophiles who are dedicated
                to curating the best selection of books across all genres - from
                timeless classics to contemporary bestsellers.
              </p>
              <p className="text-gray-700">
                We believe that books have the power to educate, inspire, and
                transform lives. That's why we're committed to promoting
                literacy and fostering a love for reading in communities
                everywhere.
              </p>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Our Values</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <BookOpen
                    className="text-indigo-600 mr-3 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <div>
                    <span className="font-medium block">Knowledge for All</span>
                    <span className="text-gray-600">
                      Making literature accessible to everyone regardless of
                      location.
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Users
                    className="text-indigo-600 mr-3 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <div>
                    <span className="font-medium block">Community Focus</span>
                    <span className="text-gray-600">
                      Building a global community of readers and authors.
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Globe
                    className="text-indigo-600 mr-3 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <div>
                    <span className="font-medium block">Sustainability</span>
                    <span className="text-gray-600">
                      Committed to environmentally friendly practices.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">Jane Doe</h3>
                <p className="text-indigo-600 mb-3">Founder & CEO</p>
                <p className="text-gray-600">
                  With over 15 years in publishing, Jane brings expertise and
                  passion to Pukapuka's mission.
                </p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">John Smith</h3>
                <p className="text-indigo-600 mb-3">Head of Curation</p>
                <p className="text-gray-600">
                  John's literary expertise ensures our catalog features only
                  the highest quality selections.
                </p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">Emily Chen</h3>
                <p className="text-indigo-600 mb-3">Customer Experience</p>
                <p className="text-gray-600">
                  Emily is dedicated to ensuring every customer has an
                  exceptional shopping experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-100 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">
            Join Our Journey
          </h2>
          <p className="text-indigo-700 mb-6">
            Discover our vast selection of books and become part of our growing
            community of readers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/products"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
            >
              Explore Our Collection
            </Link>
            <Link
              href="/contact"
              className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
              <Mail size={18} />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
