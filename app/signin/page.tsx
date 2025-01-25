"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function SignIn() {
  const [role, setRole] = useState("Admin"); // Default role
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      // Authenticate user using Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);

      // Redirect based on role
      switch (role) {
        case "Admin":
          router.push("/admin-dashboard");
          break;
        case "Student":
          router.push("/student-dashboard");
          break;
        case "Recruiter":
          router.push("/recruiter-dashboard");
          break;
        default:
          throw new Error("Invalid role selected.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("auth/user-not-found")) {
          setError("No user found with this email.");
        } else if (err.message.includes("auth/wrong-password")) {
          setError("Invalid password. Please try again.");
        } else if (err.message.includes("auth/too-many-requests")) {
          setError("Too many login attempts. Please try again later.");
        } else {
          setError(err.message || "Sign-in failed. Please try again.");
        }
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-green-600 to-green-900 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-green-600 text-center mb-6">Sign In</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-black mb-2">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
          >
            <option value="Admin">Admin</option>
            <option value="Student">Student</option>
            <option value="Recruiter">Recruiter</option>
          </select>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
