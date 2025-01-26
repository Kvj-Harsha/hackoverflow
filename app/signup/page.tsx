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
  instituteID?: string; // for student role
  password?: string;
  confirmPassword?: string;
  studentName?: string; // for student role
}

export default function SignUp() {
  const [role, setRole] = useState("Admin"); // Default to Admin for dynamic rendering
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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
        const instituteDocRef = doc(db, "institutes", collegeName || "");
        const instituteSnapshot = await getDoc(instituteDocRef);

        let instituteID;

        if (instituteSnapshot.exists()) {
          instituteID = instituteSnapshot.data()?.instituteID;
        } else {
          instituteID = Math.floor(10000 + Math.random() * 90000);
          await setDoc(instituteDocRef, { instituteID, name: collegeName });
        }

        if (email) {
          await setDoc(doc(db, "admins", email), { ...rest, email, instituteID, role, password });
        }

        router.push("/admin"); // Redirect to admin page
      } else if (role === "Recruiter") {
        if (!companyName) {
          setError("Company name is required for Recruiter.");
          return;
        }

        if (email) {
          await setDoc(doc(db, "recruiters", email), { ...rest, email, companyName, role, password });
        }

        router.push("/recruiter"); // Redirect to recruiter page
      } else if (role === "Student") {
        if (!instituteID) {
          setError("Institute ID is required for Student.");
          return;
        }

        const trimmedInstituteID = instituteID.trim(); // Ensure no extra spaces
        const institutesRef = collection(db, "institutes");
        const q = query(institutesRef, where("instituteID", "==", Number(trimmedInstituteID) || trimmedInstituteID));
        const instituteSnapshot = await getDocs(q);

        if (instituteSnapshot.empty) {
          setError("Invalid institute ID.");
          return;
        }

        const instituteData = instituteSnapshot.docs[0].data();
        const campusName = instituteData?.name;

        if (email) {
          await setDoc(doc(db, "students", email), {
            ...rest,
            email,
            instituteID: trimmedInstituteID,
            role,
            password,
            collegeName: campusName,
          });
        }

        router.push("/student"); // Redirect to student page
      } else {
        throw new Error("Invalid role selected");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Sign-up failed. Please try again.");
      } else {
        setError("Sign-up failed. Please try again.");
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-600 to-blue-900 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">Sign Up</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-black mb-2">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="Admin">Admin</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Student">Student</option>
          </select>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          {role === "Admin" && (
            <>
              <div>
                <label className="block text-sm font-medium text-black">College Name</label>
                <input
                  type="text"
                  name="collegeName"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.collegeName}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Address</label>
                <input
                  type="text"
                  name="address"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Admin Name</label>
                <input
                  type="text"
                  name="adminName"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {role === "Recruiter" && (
            <>
              <div>
                <label className="block text-sm font-medium text-black">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.companyName}
                  required
                />
              </div>
            </>
          )}

          {role === "Student" && (
            <>
              <div>
                <label className="block text-sm font-medium text-black">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.studentName}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Institute ID</label>
                <input
                  type="text"
                  name="instituteID"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.instituteID}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Age</label>
                <input
                  type="number"
                  name="age"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.age}
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-black">Email</label>
            <input
              type="email"
              name="email"
              className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              onChange={handleInputChange}
              value={formData.email}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Phone</label>
            <input
              type="text"
              name="phone"
              className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              onChange={handleInputChange}
              value={formData.phone}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Password</label>
            <input
              type="password"
              name="password"
              className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              onChange={handleInputChange}
              value={formData.password}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              onChange={handleInputChange}
              value={formData.confirmPassword}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
