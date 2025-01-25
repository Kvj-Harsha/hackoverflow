"use client"
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Define a type for form data
interface FormData {
  email: string;
  name?: string;
  collegeName?: string;
  address?: string;
  adminName?: string;
  phone: string;
  age?: string;
  campusName?: string;
  companyName?: string;
  instituteIDs?: string[];
  posts?: string[];
  password?: string;
  confirmPassword?: string;
}

export default function SignUp() {
  const [role, setRole] = useState("Admin"); // Default to Admin for dynamic rendering
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    collegeName: "", // Ensure collegeName is included in the state
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

    const { email, collegeName, password, confirmPassword, ...rest } = formData;

    // Ensure that the collegeName is not empty
    if (!collegeName) {
      setError("College name is required."); // Set error message
      return; // Stop further execution
    }

    // Ensure passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Handle Admin role
      if (role === "Admin") {
        const instituteDocRef = doc(db, "institutes", collegeName);
        const instituteSnapshot = await getDoc(instituteDocRef);

        let instituteID;

        // If the college exists, use the existing ID
        if (instituteSnapshot.exists()) {
          instituteID = instituteSnapshot.data()?.instituteID;
        } else {
          // Otherwise, generate a new ID
          instituteID = Math.floor(10000 + Math.random() * 90000);
          await setDoc(instituteDocRef, { instituteID, name: collegeName });
        }

        // Store admin data with the college's institute ID
        await setDoc(doc(db, "admins", email), { ...rest, email, instituteID, role, password });
      } else if (role === "Recruiter") {
        const { email, ...rest } = formData;
        await setDoc(doc(db, "recruiters", email), { ...rest, email, role, password });
      } else if (role === "Student") {
        const { email, ...rest } = formData;
        await setDoc(doc(db, "students", email), { ...rest, email, role, password });
      } else {
        throw new Error("Invalid role selected");
      }

      // Redirect to the admin page
      router.push("/admin");
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
          {/* Render Admin-specific fields */}
          {role === "Admin" && (
            <>
              <div>
                <label className="block text-sm font-medium text-black">College Name</label>
                <input
                  type="text"
                  name="collegeName"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.collegeName}  // Ensure the value is bound to state
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
              <div>
                <label className="block text-sm font-medium text-black">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.email}  // Bind email to the state
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
                  value={formData.phone}  // Bind phone to the state
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
            </>
          )}

          {/* Render other role-specific fields (Recruiter and Student) here */}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
