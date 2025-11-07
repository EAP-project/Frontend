"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { register as registerUser, RegistrationRequest } from "@/lib/api";
import {
  User,
  Mail,
  Lock,
  Phone,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Schema for adding employee/admin
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
    role: z.enum(["ADMIN", "EMPLOYEE"]).describe("Please select a role"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AddUserFormValues = z.infer<typeof formSchema>;

export default function AddUserPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);

      if (parsedUser.role !== "ADMIN") {
        router.push("/dashboard/customer");
        return;
      }
    } catch (err) {
      console.error("Error parsing user:", err);
      router.push("/login");
      return;
    }
  }, [router]);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "EMPLOYEE",
    },
  });

  const onSubmit = async (data: AddUserFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

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

      const response = await registerUser(payload);
      setSuccess(true);
      setSuccessMessage(
        `${data.role === "ADMIN" ? "Admin" : "Employee"} "${
          response.username
        }" added successfully!`
      );

      // Reset form after successful submission
      form.reset();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add user. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-blue-600" />
              Add Employee or Admin
            </h1>
            <p className="text-gray-600 mt-2">
              Create new employee or admin accounts for the system
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Success!</h3>
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-700">
                        User Role *
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="EMPLOYEE"
                              checked={field.value === "EMPLOYEE"}
                              onChange={() => field.onChange("EMPLOYEE")}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-gray-700">Employee</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="ADMIN"
                              checked={field.value === "ADMIN"}
                              onChange={() => field.onChange("ADMIN")}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-gray-700">Admin</span>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base text-gray-700">
                          Username *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                              placeholder="Enter username"
                              className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                              autoComplete="username"
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
                        <FormLabel className="text-base text-gray-700">
                          Email *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                              type="email"
                              placeholder="user@example.com"
                              className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                              autoComplete="email"
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
                        <FormLabel className="text-base text-gray-700">
                          First Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter first name"
                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                            autoComplete="given-name"
                            {...field}
                          />
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
                        <FormLabel className="text-base text-gray-700">
                          Last Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter last name"
                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                            autoComplete="family-name"
                            {...field}
                          />
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
                        <FormLabel className="text-base text-gray-700">
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                              type="tel"
                              placeholder="1234567890"
                              className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                              autoComplete="tel"
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
                        <FormLabel className="text-base text-gray-700">
                          Password *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                              type="password"
                              placeholder="Enter password"
                              className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
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
                        <FormLabel className="text-base text-gray-700">
                          Confirm Password *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                              type="password"
                              placeholder="Confirm password"
                              className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                              autoComplete="new-password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Adding User...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Add User
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="h-12 px-6 border-gray-300 hover:bg-gray-50"
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Information Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              ℹ️ Important Information
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>
                <strong>Employees</strong> can manage appointments, add time
                logs, and update job status
              </li>
              <li>
                <strong>Admins</strong> have full access to manage users,
                services, and view all reports
              </li>
              <li>
                New users will receive their credentials and can log in
                immediately
              </li>
              <li>Make sure to provide strong passwords for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
