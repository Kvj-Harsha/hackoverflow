"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

interface FormData {
  email: string;
  name?: string;
  collegeName?: string;
  address?: string;
  adminName?: string;
  phone: string;
  age?: string;
  companyName?: string;
  instituteID?: string;
  password?: string;
  confirmPassword?: string;
  studentName?: string;
}

export default function SignUp() {
  const [role, setRole] = useState("Admin");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    collegeName: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, collegeName, password, confirmPassword, studentName, instituteID, companyName, ...rest } = formData;

    if (role === "Admin" && !collegeName) {
      setError("College name is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (role === "Admin") {
        const instituteRef = doc(db, "institutes", collegeName || "");
        const instituteSnap = await getDoc(instituteRef);
        let instituteID;

        if (instituteSnap.exists()) {
          instituteID = instituteSnap.data()?.instituteID;
        } else {
          instituteID = Math.floor(10000 + Math.random() * 90000);
          await setDoc(instituteRef, { instituteID, name: collegeName });
        }

        if (email) {
          await setDoc(doc(db, "admins", email), { ...rest, email, instituteID, role, password });
        }
        router.push("/admin");
      } else if (role === "Recruiter") {
        if (!companyName) {
          setError("Company name is required for Recruiter.");
          return;
        }

        if (email) {
          await setDoc(doc(db, "recruiters", email), { ...rest, email, companyName, role, password });
        }
        router.push("/recruiter");
      } else if (role === "Student") {
        if (!instituteID) {
          setError("Institute ID is required.");
          return;
        }

        const instituteQuery = query(
          collection(db, "institutes"),
          where("instituteID", "==", Number(instituteID.trim()))
        );
        const instituteSnap = await getDocs(instituteQuery);

        if (instituteSnap.empty) {
          setError("Invalid institute ID.");
          return;
        }

        const campusName = instituteSnap.docs[0].data().name;
        if (email) {
          await setDoc(doc(db, "students", email), {
            ...rest,
            email,
            instituteID,
            role,
            password,
            collegeName: campusName,
          });
        }
        router.push("/student");
      } else {
        throw new Error("Invalid role selected");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-600 to-blue-900 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-semibold text-blue-700 text-center mb-6">Sign Up</h2>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="Admin">Admin</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Student">Student</option>
            </select>
          </div>
          {/* Conditional Role-Specific Inputs */}
          {role === "Admin" && (
            <>
              <input
                type="text"
                name="collegeName"
                placeholder="College Name"
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                required
              />
            </>
          )}
          {/* Recruiter */}
          {role === "Recruiter" && (
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              required
            />
          )}
          {/* Student */}
          {role === "Student" && (
            <>
              <input
                type="text"
                name="studentName"
                placeholder="Student Name"
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="text"
                name="instituteID"
                placeholder="Institute ID"
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                required
              />
            </>
          )}
          {/* Common Inputs */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
