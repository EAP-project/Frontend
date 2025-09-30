// "use client";

// import Link from "next/link";
// import { Button} from "@/components/ui/Button"
// import { Card } from "@/components/ui/card";
// import {
//   Clock,
//   Calendar,
//   Wrench,
//   Users,
//   BarChart3,
//   Shield,
//   ArrowRight,
//   Sparkles,
// } from "lucide-react";

// export default function HomePage() {
//   return (
//     <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       {/* Navbar */}
//       <nav className="sticky top-0 z-50 border-b border-border/40 bg-white/70 backdrop-blur-xl">
//         <div className="mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="flex h-16 items-center justify-between">
//             <div className="flex items-center gap-2">
//               <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
//                 <Wrench className="h-5 w-5 text-white" />
//               </div>
//               <span className="text-lg font-bold text-indigo-700">
//                 AutoService
//               </span>
//             </div>
//             <div className="flex items-center gap-3">
//               <Button
//                 asChild
//                 variant="ghost"
//                 size="sm"
//                 className="hidden sm:inline-flex"
//               >
//                 <Link href="/login">Log in</Link>
//               </Button>
//               <Button
//                 asChild
//                 size="sm"
//                 className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
//               >
//                 <Link href="/signup">Sign up</Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0">
//           <img
//             src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1500&q=80"
//             alt="Car Service Background"
//             className="h-full w-full object-cover opacity-30"
//           />
//           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/40 via-white/60 to-blue-100/70" />
//         </div>

//         <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8 lg:py-36 text-center">
//           <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/40 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
//             <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
//             <span className="text-indigo-800">
//               Trusted by 500+ service centers
//             </span>
//           </div>

//           <h1 className="text-5xl font-bold tracking-tight text-indigo-900 sm:text-6xl lg:text-7xl">
//             Service management made{" "}
//             <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
//               effortless
//             </span>
//           </h1>

//           <p className="mt-8 text-lg leading-relaxed text-gray-700 sm:text-xl lg:text-2xl">
//             The complete platform for automobile service operations. Track time,
//             manage appointments, and delight customers—all in one place.
//           </p>

//           <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
//             <Button
//               asChild
//               size="lg"
//               className="h-12 w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-base text-white sm:w-auto"
//             >
//               <Link href="/signup">
//                 Get started—it's free
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>
//             <Button
//               asChild
//               size="lg"
//               variant="outline"
//               className="h-12 w-full rounded-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 text-base sm:w-auto"
//             >
//               <Link href="/login">Sign in</Link>
//             </Button>
//           </div>

//           <p className="mt-6 text-sm text-gray-600">
//             No credit card required • Free 14-day trial
//           </p>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
//         <div className="mx-auto max-w-2xl text-center mb-20">
//           <h2 className="text-4xl font-bold tracking-tight text-indigo-900 sm:text-5xl">
//             Everything you need to run your service center
//           </h2>
//           <p className="mt-6 text-lg text-gray-600">
//             Powerful tools designed for modern automobile service operations
//           </p>
//         </div>

//         <div className="grid gap-8 lg:grid-cols-3">
//           {[
//             {
//               icon: <Clock className="h-7 w-7 text-indigo-600" />,
//               title: "Time Tracking",
//               desc: "Log service hours with precision. Generate detailed reports and track technician productivity in real-time.",
//               img: "https://cdn-icons-png.flaticon.com/512/2920/2920244.png",
//             },
//             {
//               icon: <Calendar className="h-7 w-7 text-indigo-600" />,
//               title: "Smart Scheduling",
//               desc: "Manage appointments effortlessly with automated reminders, conflict detection, and customer notifications.",
//               img: "https://cdn-icons-png.flaticon.com/512/747/747310.png",
//             },
//             {
//               icon: <Wrench className="h-7 w-7 text-indigo-600" />,
//               title: "Service History",
//               desc: "Complete maintenance records at your fingertips. Track every service, part, and interaction.",
//               img: "https://cdn-icons-png.flaticon.com/512/1055/1055646.png",
//             },
//           ].map((feature, i) => (
//             <Card
//               key={i}
//               className="group relative overflow-hidden border border-indigo-100 bg-white p-8 rounded-2xl shadow-md transition-all hover:border-indigo-300 hover:shadow-xl"
//             >
//               <div className="flex justify-center mb-6">
//                 <img
//                   src={feature.img}
//                   alt={feature.title}
//                   className="h-20 w-20 object-contain"
//                 />
//               </div>
//               <h3 className="mb-3 text-2xl font-bold text-indigo-800">
//                 {feature.title}
//               </h3>
//               <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
//             </Card>
//           ))}
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
//         <div className="mx-auto max-w-7xl px-6 text-center">
//           <h2 className="text-4xl font-bold sm:text-5xl">
//             Ready to transform your service operations?
//           </h2>
//           <p className="mt-6 text-lg text-blue-100 sm:text-xl">
//             Join hundreds of service centers already streamlining their
//             operations with AutoService
//           </p>
//           <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
//             <Button
//               asChild
//               size="lg"
//               className="h-12 w-full rounded-full bg-white text-indigo-700 hover:bg-gray-100 hover:text-gray-800 sm:w-auto transition-colors"
//             >
//               <Link href="/signup">
//                 Start free trial
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>

//             <Button
//               asChild
//               size="lg"
//               variant="outline"
//               className="h-12 w-full rounded-full border-2 border-white text-white hover:bg-white/10 px-8 text-base sm:w-auto"
//             >
//               <Link href="/login">Sign in to your account</Link>
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-indigo-100 bg-white">
//         <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
//           <div className="flex items-center gap-2">
//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
//               <Wrench className="h-4 w-4 text-white" />
//             </div>
//             <span className="text-sm font-semibold text-indigo-700">
//               AutoService
//             </span>
//           </div>
//           <p className="text-sm text-gray-500">
//             © 2025 AutoService. All rights reserved.
//           </p>
//         </div>
//       </footer>
//     </main>
//   );
// }


export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">
        Automobile Service Time Logging & Appointment System
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Book your service appointments easily, track service times, and manage your automobile
        maintenance with ease.
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Login
        </a>
        <a
          href="/signup"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
        >
          Sign Up
        </a>
      </div>
    </main>
  );
}
