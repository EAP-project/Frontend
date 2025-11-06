"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import {
  Wrench,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Lock,
  User,
  Phone,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register, RegistrationRequest } from "@/lib/api";

// Schema for signup - matches backend User model
const formSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email address"),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must not exceed 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must not exceed 50 characters"),
    phoneNumber: z
      .string()
      .regex(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
    role: z
      .enum(["ADMIN", "EMPLOYEE", "CUSTOMER"])
      .describe("Please select a role"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof formSchema>;

// Response types matching backend

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "CUSTOMER",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: RegistrationRequest = {
        username: data.username,
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: data.role,
      };

      const registrationResponse = await register(payload);
      console.log("Registration successful:", registrationResponse);

      // Show success state
      setSuccess(true);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      if (err instanceof Error)
        setError(
          err.message || "Failed to connect to server. Please try again."
        );
      else setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // If registration is successful, show success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Registration Successful!
            </h1>
            <p className="text-gray-600 mb-4">
              Your account has been created successfully.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Verify Your Email
                  </p>
                  <p className="text-sm text-blue-700">
                    We've sent a verification link to your email address. Please
                    check your inbox and verify your account before logging in.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to login page in 3 seconds...
            </p>
            <Link
              href="/login"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Back Button */}
      <div className="p-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-2 text-blue-700 hover:text-blue-900"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left Column with Illustration & Benefits */}
            <div className="hidden lg:flex lg:flex-col lg:justify-center">
              <Image
                src="/images/signup.jpg"
                alt="Sign Up Illustration"
                width={500}
                height={400}
                className="mb-8"
              />
              <h2 className="text-4xl font-bold text-purple-800 mb-6 xl:text-5xl">
                Start managing your service center better
              </h2>
              <p className="text-lg text-purple-600 mb-10">
                Join hundreds of service centers using AutoService to streamline
                operations and delight customers.
              </p>
              <div className="space-y-4">
                {["Free 14-day trial", "Easy setup", "24/7 support"].map(
                  (text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-purple-800">
                          {text}
                        </div>
                        <div className="text-sm text-purple-600">
                          {i === 0
                            ? "No credit card required to get started"
                            : i === 1
                            ? "Get up and running in under 5 minutes"
                            : "Our team is here to help whenever you need"}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right Column - Sign Up Form */}
            <div className="flex flex-col justify-center">
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-4xl font-bold text-purple-800 mb-3">
                  Create your account
                </h1>
                <p className="text-purple-600 text-lg">
                  Start your free trial today
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                  {error}
                </div>
              )}

              {/* Sign Up Form Card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    {/* Username */}
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base text-purple-700">
                            Username
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                              <Input
                                placeholder="Enter username"
                                className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                                autoComplete="username"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    {/* First Name */}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base text-purple-700">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                              <Input
                                placeholder="John"
                                className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                                autoComplete="given-name"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    {/* Last Name */}
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base text-purple-700">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                              <Input
                                placeholder="Doe"
                                className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                                autoComplete="family-name"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base text-purple-700">
                            Email
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                                autoComplete="email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    {/* Phone Number */}
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base text-purple-700">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                              <Input
                                type="tel"
                                placeholder="1234567890"
                                className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                                autoComplete="tel"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    {/* Role */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base text-purple-700">
                            Role
                          </FormLabel>
                          <FormControl>
                            <select
                              className="w-full h-12 pl-3 rounded-xl text-base border border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all bg-white"
                              {...field}
                            >
                              <option value="">Select a role</option>
                              <option value="CUSTOMER">Customer</option>
                              <option value="EMPLOYEE">Employee</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    {/* Password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base text-purple-700">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                              <Input
                                type="password"
                                placeholder="Enter password"
                                className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                                autoComplete="new-password"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base text-purple-700">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                              <Input
                                type="password"
                                placeholder="Confirm password"
                                className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                                autoComplete="new-password"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </Form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-purple-600">
                      Or sign up with
                    </span>
                  </div>
                </div>

                {/* Social Sign Up Buttons */}
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl border-2 border-purple-500 text-purple-600 hover:bg-gray-50 hover:text-black hover:border-black transition-colors"
                  >
                    Google
                  </Button>
                </div>

                {/* Terms */}
                <p className="text-xs text-purple-600 text-center mt-6">
                  By signing up, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="underline hover:text-purple-800 transition-colors"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline hover:text-purple-800 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Login Link */}
              <p className="text-center text-purple-600 mt-8">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold hover:text-purple-800 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
