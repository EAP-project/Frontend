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
import { ArrowLeft, Mail, Lock, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

// Schema for login - updated to use email instead of username
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Response types matching backend
interface LoginResponse {
  message: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  token: string;
  tokenType: string;
}

interface ErrorResponse {
  error: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const loginResponse = await login(data);
      console.log("Login successful:", loginResponse);

      // Store token in localStorage
      localStorage.setItem("token", loginResponse.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: loginResponse.username,
          email: loginResponse.email,
          role: loginResponse.role,
          firstName: loginResponse.firstName,
          lastName: loginResponse.lastName,
          phoneNumber: loginResponse.phoneNumber,
        })
      );

      // Redirect to dashboard or home page
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message === "Failed to fetch") {
        setError(
          "Unable to connect to server. Please check if the server is running."
        );
      } else {
        setError(
          error.message || "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Left Illustration */}
            <div className="hidden lg:flex lg:flex-col lg:justify-center">
              <Image
                src="/images/signin.webp"
                alt="Login Illustration"
                width={500}
                height={400}
                className="mb-8"
              />
              <h2 className="text-4xl font-bold text-purple-800 mb-6 xl:text-5xl">
                Welcome back!
              </h2>
              <p className="text-lg text-purple-600 mb-10">
                Log in to manage your service center dashboard, track jobs, and
                connect with customers instantly.
              </p>

              <div className="space-y-4">
                {["Secure login", "Fast access", "24/7 support"].map(
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
                            ? "Your data is always protected"
                            : i === 1
                            ? "Quick access to your account anytime"
                            : "Our team is here whenever you need help"}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right - Login Form */}
            <div className="flex flex-col justify-center">
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-4xl font-bold text-purple-800 mb-3">
                  Sign in to your account
                </h1>
                <p className="text-purple-600 text-lg">
                  Welcome back! Please enter your details
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                  {error}
                </div>
              )}

              {/* Login Form Card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
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
                                placeholder="Enter your email"
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
                                placeholder="Enter your password"
                                className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                                autoComplete="current-password"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
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
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl border-2 border-purple-500 text-purple-600 hover:bg-gray-50 hover:text-black hover:border-black transition-colors"
                  >
                    Google
                  </Button>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-purple-600 mt-8">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold hover:text-purple-800 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
