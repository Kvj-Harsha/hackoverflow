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

    const { email, collegeName, password, confirmPassword, campusName, ...rest } = formData;

    // Ensure that the collegeName is not empty for Admin role
    if (role === "Admin" && !collegeName) {
      setError("College name is required.");
      return;
    }

    // Ensure passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Handle Admin role
      if (role === "Admin") {
        if (!collegeName) {
          setError("College name is required for Admin.");
          return;
        }

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
        if (email) {
          await setDoc(doc(db, "admins", email), { ...rest, email, instituteID, role, password });
        }
      } else if (role === "Recruiter") {
        const { companyName, instituteIDs, posts, password, ...rest } = formData;

        if (email) {
          await setDoc(doc(db, "recruiters", email), { ...rest, email, companyName, instituteIDs, posts, role, password });
        }
      } else if (role === "Student") {
        const { age, campusName, password, ...rest } = formData;

        if (!campusName) {
          setError("Campus name is required for Student.");
          return;
        }

        const campusDocRef = doc(db, "institutes", campusName);
        const campusSnapshot = await getDoc(campusDocRef);

        if (!campusSnapshot.exists()) {
          setError("Invalid campus name.");
          return;
        }

        const instituteID = campusSnapshot.data()?.instituteID;

        if (email) {
          await setDoc(doc(db, "students", email), { ...rest, email, age, campusName, instituteID, role, password });
        }
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

          {/* Render Recruiter-specific fields */}
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
              <div>
                <label className="block text-sm font-medium text-black">Institute IDs</label>
                <input
                  type="text"
                  name="instituteIDs"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.instituteIDs?.join(", ")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Posts</label>
                <input
                  type="text"
                  name="posts"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.posts?.join(", ")}
                  required
                />
              </div>
            </>
          )}

          {/* Render Student-specific fields */}
          {role === "Student" && (
            <>
              <div>
                <label className="block text-sm font-medium text-black">Campus Name</label>
                <input
                  type="text"
                  name="campusName"
                  className="w-full mt-1 p-3 bg-gray-50 text-black border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  onChange={handleInputChange}
                  value={formData.campusName}
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
