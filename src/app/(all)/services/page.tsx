"use client";

import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  Pill,
  Calendar,
  ShieldCheck,
  Activity,
  Clock,
  ChevronRight,
  Users,
  Laptop,
} from "lucide-react";

const services = [
  {
    title: "Find a Doctor",
    description:
      "Connect with verified healthcare professionals across various specialties near you.",
    icon: <Stethoscope className="h-6 w-6" />,
    link: "/find-doctor",
    color: "bg-green-100 text-green-600",
    features: ["Specialist Discovery", "Verified Reviews", "Location Filters"],
  },
  {
    title: "Medicine Database",
    description:
      "Access detailed information on thousands of medications, including dosage and side effects.",
    icon: <Pill className="h-6 w-6" />,
    link: "/medicines",
    color: "bg-blue-100 text-blue-600",
    features: ["Generic Alternatives", "Drug Interactions", "OTC & Rx Guides"],
  },
  {
    title: "Appointment Management",
    description:
      "Book, reschedule, or cancel appointments with ease using our synchronized calendar.",
    icon: <Calendar className="h-6 w-6" />,
    link: "/appointment-management",
    color: "bg-indigo-100 text-indigo-600",
    features: ["Instant Confirmation", "Reminders", "Digital Queue"],
  },
  {
    title: "Health Records",
    description:
      "Securely store and manage your medical history, prescriptions, and lab reports.",
    icon: <ShieldCheck className="h-6 w-6" />,
    link: "/profile",
    color: "bg-purple-100 text-purple-600",
    features: ["End-to-End Encryption", "Lab Integration", "Family Profiles"],
  },
  {
    title: "Medical Conditions",
    description:
      "Browse an extensive library of medical problems to understand symptoms and treatments.",
    icon: <Activity className="h-6 w-6" />,
    link: "/problems",
    color: "bg-red-100 text-red-600",
    features: ["Symptom Checker", "Expert Articles", "First Aid Guides"],
  },
  {
    title: "Virtual Consultation",
    description:
      "Speak with doctors from the comfort of your home through our secure video platform.",
    icon: <Laptop className="h-6 w-6" />,
    link: "/contact",
    color: "bg-amber-100 text-amber-600",
    features: ["High-Def Video", "Private Chat", "Digital Prescriptions"],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* --- Hero Section --- */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Our <span className="text-blue-600">Healthcare</span> Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            HealthSync provides a comprehensive ecosystem designed to make
            healthcare accessible, organized, and reliable for everyone in
            Bangladesh.
          </p>
        </div>
      </section>

      {/* --- Services Grid --- */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col"
              >
                <div
                  className={`p-3 rounded-xl w-fit mb-6 ${service.color} transition-transform group-hover:scale-110`}
                >
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-8 flex-grow">
                  {service.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className="flex items-center text-xs text-gray-500"
                    >
                      <div className="h-1 w-1 bg-blue-500 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={service.link}
                  className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all"
                >
                  Learn More <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Why Choose Us --- */}
      <section className="bg-gray-900 py-20 px-4 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why HealthSync?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Save Time</h4>
                    <p className="text-gray-400 text-sm">
                      Skip the long queues at hospitals. Book appointments in
                      seconds.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Reliable Professionals</h4>
                    <p className="text-gray-400 text-sm">
                      Every doctor on our platform is verified by official
                      medical boards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">
                  Start your journey today.
                </h3>
                <p className="text-blue-100 mb-8">
                  Create an account to unlock personalized health tips and 24/7
                  support.
                </p>
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-block"
                >
                  Join HealthSync
                </Link>
              </div>
              {/* Background Decoration */}
              <div className="absolute -bottom-12 -right-12 h-64 w-64 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
