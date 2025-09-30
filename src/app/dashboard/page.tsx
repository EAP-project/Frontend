"use client";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Dashboard</h2>
        <p className="text-gray-600 mb-6">
          Welcome to your Automobile Service Dashboard.  
          Here you’ll be able to manage your appointments and service logs.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Book Appointment
          </button>
          <button className="py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700">
            View Service Logs
          </button>
          <button className="py-3 px-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 col-span-2">
            Manage Profile
          </button>
        </div>
      </div>
    </main>
  );
}
