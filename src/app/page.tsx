"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Calendar,
  Wrench,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  Sparkles,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  PhoneCall,
  MapIcon,
  CheckCircle,
  Star,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Navbar */}
      <nav
        className="sticky top-0 z-50 border-b border-white/20 bg-white/30 backdrop-blur-2xl shadow-sm transition-all duration-300"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                AutoService
              </span>
            </div>

            {/* Buttons (only visible on lg screens) */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="inline-flex text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <Link href="/login" className="text-[16px]">
                  Sign In
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="flex rounded-full bg-gradient-to-r from-purple-600 to-blue-500  text-white  hover:from-purple-700 hover:to-blue-600  transition-all "
              >
                <Link
                  href="/signup"
                  className="flex items-center gap-2 text-[16px]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600/5 via-blue-50/30 to-purple-600/5">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1500&q=80"
            alt="Car Service Background"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/40 via-white/60 to-blue-100/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-white/80 px-6 py-3 text-sm font-medium shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-indigo-800 font-semibold">
                Trusted by 500+ service centers worldwide
              </span>
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Streamline Your{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Auto Service
              </span>{" "}
              Business
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-gray-600 sm:text-2xl">
              The all-in-one platform that helps service centers manage
              appointments, track time, and delight customers with ease and
              efficiency.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-lg font-semibold text-white shadow-2xl hover:shadow-3xl transition-all duration-300 sm:w-auto px-8"
              >
                <Link href="/signup" className="flex items-center gap-3">
                  Register Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 w-full rounded-2xl border-2 border-gray-300 bg-white/80 text-gray-700 hover:bg-green-800 hover:border-green-600 hover:text-white text-lg font-medium backdrop-blur-sm transition-all duration-300 sm:w-auto px-8"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                "Premium Services",
                "Secure & Reliable Platform",
                "Setup in 5 minutes",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center gap-2 text-gray-600"
                >
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Everything You Need to
            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              {" "}
              Succeed
            </span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            Powerful tools designed specifically for modern automobile service
            operations
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              icon: <Clock className="h-8 w-8 text-indigo-600" />,
              title: "Smart Time Tracking",
              desc: "Log service hours with precision. Generate detailed reports and track technician productivity in real-time.",
              features: [
                "Real-time tracking",
                "Productivity reports",
                "Automated billing",
              ],
            },
            {
              icon: <Calendar className="h-8 w-8 text-indigo-600" />,
              title: "Intelligent Scheduling",
              desc: "Manage appointments effortlessly with automated reminders, conflict detection, and customer notifications.",
              features: [
                "Auto-reminders",
                "Conflict detection",
                "Customer notifications",
              ],
            },
            {
              icon: <Wrench className="h-8 w-8 text-indigo-600" />,
              title: "Complete Service History",
              desc: "Maintain comprehensive service records. Track every repair, part, and customer interaction seamlessly.",
              features: [
                "Full maintenance history",
                "Part tracking",
                "Customer insights",
              ],
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="group relative overflow-hidden border border-gray-200 bg-white p-8 rounded-3xl shadow-lg transition-all duration-300 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                {feature.icon}
              </div>

              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                {feature.title}
              </h3>

              <p className="mb-6 text-gray-600 leading-relaxed">
                {feature.desc}
              </p>

              <ul className="space-y-3">
                {feature.features.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold sm:text-5xl">
            Ready to Transform Your Business?
          </h2>
          <p className="mt-6 text-xl text-blue-100 sm:text-2xl">
            Join hundreds of service centers already streamlining their
            operations with AutoService
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full border-2 border-white text-black hover:bg-white/10 px-8 text-base sm:w-auto"
            >
              <Link href="/signup">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-2 border-white text-black hover:bg-white/10 px-8 text-base sm:w-auto"
            >
              <Link href="/login">Sign in to your account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  AutoService
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Streamlining auto service operations for businesses worldwide
                with cutting-edge technology.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Product</h3>
              <div className="space-y-3">
                {["Features", "Pricing", "Testimonials", "Security"].map(
                  (item) => (
                    <Link
                      key={item}
                      href="#"
                      className="block text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      {item}
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 flex items-center gap-3">
                  <PhoneCall className="h-4 w-4 text-indigo-600" />
                  +94 71 234 5678
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-3">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  support@autoservice.com
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-3">
                  <MapIcon className="h-4 w-4 text-indigo-600" />
                  Colombo, Sri Lanka
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Follow Us</h3>
              <div className="flex items-center gap-4">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Twitter, href: "#" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-16 border-t pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2025 AutoService. All rights reserved. Built with strong for auto
              service professionals.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
