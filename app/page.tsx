// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-600 to-blue-900 min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center text-white">
        <h1 className="text-3xl font-extrabold">Placement Platform</h1>
        <nav className="space-x-4">
          <Link href="/login" className="px-4 py-2 bg-white text-blue-600 rounded-lg shadow hover:bg-blue-100">
            Log In
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-yellow-400 text-blue-900 font-bold rounded-lg shadow hover:bg-yellow-300">
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-8 text-white">
        <h2 className="text-5xl font-extrabold leading-tight mb-6">
          Transforming Campus Recruitment
        </h2>
        <p className="text-lg font-light mb-10">
          A modern platform connecting colleges, recruiters, and students. Simplify your placement process like never before.
        </p>
        <div className="flex space-x-4">
          <Link href="/signup" className="px-8 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-300">
            Get Started
          </Link>
          <Link href="/features" className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-200">
            Learn More
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white py-16 px-8 text-center">
        <h3 className="text-3xl font-bold text-blue-600 mb-12">Features for Everyone</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 border rounded-lg shadow-lg hover:shadow-xl">
            <h4 className="text-xl font-bold text-blue-800 mb-4">Admin Panel</h4>
            <p className="text-gray-600">
              Manage colleges, placement activities, and monitor progress seamlessly.
            </p>
          </div>
          <div className="p-8 border rounded-lg shadow-lg hover:shadow-xl">
            <h4 className="text-xl font-bold text-blue-800 mb-4">Recruiter Panel</h4>
            <p className="text-gray-600">
              Post jobs, manage applications, and streamline recruitment effortlessly.
            </p>
          </div>
          <div className="p-8 border rounded-lg shadow-lg hover:shadow-xl">
            <h4 className="text-xl font-bold text-blue-800 mb-4">Student Panel</h4>
            <p className="text-gray-600">
              Build your profile, apply for jobs, and prepare for interviews all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-700 py-6 text-white text-center">
        <p className="text-sm">
          © 2025 Placement Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
