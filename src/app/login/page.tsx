
// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/Button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/Input";
// import Link from "next/link";
// import { ArrowLeft, Mail, Lock, CheckCircle2 } from "lucide-react";
// import Image from "next/image";

// // Schema for login
// const loginSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

// type LoginFormValues = z.infer<typeof loginSchema>;

// export default function LoginPage() {
//   const form = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = (data: LoginFormValues) => {
//     console.log("Login Data:", data);
//     // TODO: Call backend API
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
//       {/* Back Button */}
//       <div className="p-6">
//         <Button
//           asChild
//           variant="ghost"
//           size="sm"
//           className="gap-2 text-blue-700 hover:text-blue-900"
//         >
//           <Link href="/">
//             <ArrowLeft className="h-4 w-4" />
//             Back to home
//           </Link>
//         </Button>
//       </div>

//       <div className="flex flex-1 items-center justify-center p-6">
//         <div className="w-full max-w-6xl">
//           <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
//             {/* Left Illustration */}
//             <div className="hidden lg:flex lg:flex-col lg:justify-center">
//               <Image
//                 src="/images/signin.webp" // 👉 replace with your login illustration
//                 alt="Login Illustration"
//                 width={500}
//                 height={400}
//                 className="mb-8"
//               />
//               <h2 className="text-4xl font-bold text-purple-800 mb-6 xl:text-5xl">
//                 Welcome back!
//               </h2>
//               <p className="text-lg text-purple-600 mb-10">
//                 Log in to manage your service center dashboard, track jobs, and
//                 connect with customers instantly.
//               </p>

//               <div className="space-y-4">
//                 {["Secure login", "Fast access", "24/7 support"].map(
//                   (text, i) => (
//                     <div key={i} className="flex items-start gap-3">
//                       <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100">
//                         <CheckCircle2 className="h-4 w-4 text-purple-600" />
//                       </div>
//                       <div>
//                         <div className="font-semibold text-purple-800">
//                           {text}
//                         </div>
//                         <div className="text-sm text-purple-600">
//                           {i === 0
//                             ? "Your data is always protected"
//                             : i === 1
//                             ? "Quick access to your account anytime"
//                             : "Our team is here whenever you need help"}
//                         </div>
//                       </div>
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>

//             {/* Right - Login Form */}
//             <div className="flex flex-col justify-center">
//               <div className="text-center lg:text-left mb-8">
//                 <h1 className="text-4xl font-bold text-purple-800 mb-3">
//                   Sign in to your account
//                 </h1>
//                 <p className="text-purple-600 text-lg">
//                   Welcome back! Please enter your details
//                 </p>
//               </div>

//               {/* Login Form Card */}
//               <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
//                 <Form {...form}>
//                   <form
//                     onSubmit={form.handleSubmit(onSubmit)}
//                     className="space-y-5"
//                   >
//                     {/* Email */}
//                     <FormField
//                       control={form.control}
//                       name="email"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-base text-purple-700">
//                             Email
//                           </FormLabel>
//                           <FormControl>
//                             <div className="relative">
//                               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
//                               <Input
//                                 type="email"
//                                 placeholder="you@example.com"
//                                 className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
//                                 {...field}
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage className="text-red-600" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Password */}
//                     <FormField
//                       control={form.control}
//                       name="password"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-base text-purple-700">
//                             Password
//                           </FormLabel>
//                           <FormControl>
//                             <div className="relative">
//                               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
//                               <Input
//                                 type="password"
//                                 placeholder="Enter your password"
//                                 className="h-12 pl-10 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
//                                 {...field}
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage className="text-red-600" />
//                         </FormItem>
//                       )}
//                     />

//                     {/* Forgot Password */}
//                     <div className="flex justify-end">
//                       <Link
//                         href="/forgot-password"
//                         className="text-sm text-purple-600 hover:text-purple-800"
//                       >
//                         Forgot password?
//                       </Link>
//                     </div>

//                     <Button
//                       type="submit"
//                       className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all"
//                     >
//                       Sign in
//                     </Button>
//                   </form>
//                 </Form>

//                 {/* Divider */}
//                 <div className="relative my-8">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-gray-300"></div>
//                   </div>
//                   <div className="relative flex justify-center text-sm">
//                     <span className="px-4 bg-white text-purple-600">
//                       Or continue with
//                     </span>
//                   </div>
//                 </div>

//                 {/* Social Login */}
//                 <div className="grid grid-cols-1 gap-3">
//                   <Button
//                     variant="outline"
//                     className="h-12 rounded-xl border-2 border-purple-500 text-purple-600 hover:bg-gray-50 hover:text-black hover:border-black transition-colors"
//                   >
//                     Google
//                   </Button>

//                   {/* <Button variant="outline" className="h-12 rounded-xl border-2 border-purple-500 text-purple-600 hover:bg-purple-50 transition-colors">
//                     GitHub
//                   </Button> */}
//                 </div>
//               </div>

//               {/* Sign Up Link */}
//               <p className="text-center text-purple-600 mt-8">
//                 Don’t have an account?{" "}
//                 <Link
//                   href="/signup"
//                   className="font-semibold hover:text-purple-800 transition-colors"
//                 >
//                   Sign up
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Input from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: LoginForm) => {
    console.log("Login Data:", data);
    // TODO: Call backend API with fetch/axios
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
        <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
        <p className="text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
