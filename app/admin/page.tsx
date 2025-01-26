"use client";
import React, { useEffect, useState } from "react";
import { db } from "./../../lib/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

// Define types for student and recruiter objects
interface Student {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  instituteId: string; // Assuming this is a field to link students to an institute
}

interface Recruiter {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [user, setUser] = useState<any>(null); // user can be typed more specifically if needed
  const router = useRouter();

  useEffect(() => {
    // Authentication check
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/signin"); // Redirect to login page if not authenticated
      }
    });

    const fetchData = async () => {
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const recruitersSnapshot = await getDocs(collection(db, "recruiters"));

      setStudents(
        studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[] // Explicitly typing the data
      );
      setRecruiters(
        recruitersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Recruiter[] // Explicitly typing the data
      );
    };
    fetchData();
  }, [router]);

  const approveStudent = async (studentId: string) => {
    const studentDoc = doc(db, "students", studentId);
    await updateDoc(studentDoc, { verified: true });
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, verified: true } : student
      )
    );
  };

  const rejectStudent = async (studentId: string) => {
    const studentDoc = doc(db, "students", studentId);
    await updateDoc(studentDoc, { verified: false });
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, verified: false } : student
      )
    );
  };

  const removeStudent = async (studentId: string) => {
    const studentDoc = doc(db, "students", studentId);
    await deleteDoc(studentDoc);
    setStudents((prev) => prev.filter((student) => student.id !== studentId));
  };

  const approveRecruiter = async (recruiterId: string) => {
    const recruiterDoc = doc(db, "recruiters", recruiterId);
    await updateDoc(recruiterDoc, { verified: true });
    setRecruiters((prev) =>
      prev.map((recruiter) =>
        recruiter.id === recruiterId ? { ...recruiter, verified: true } : recruiter
      )
    );
  };

  const signOutUser = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push("/signin"); // Redirect to login page after sign out
  };

  // Filter students based on the logged-in user's institute ID
  const instituteId = user?.uid; // Assuming the user's UID is the institute ID for simplicity
  const filteredStudents = students.filter(
    (student) => student.instituteId === instituteId
  );

  return (
    <div className="bg-gray-50 min-h-screen p-8 relative">
      <button
        onClick={signOutUser}
        className="absolute top-8 right-8 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Sign Out
      </button>

      <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <div className="space-y-8">
        {/* Pending Recruiter Approvals */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Pending Recruiter Approvals</h2>
          {recruiters.filter((r) => !r.verified).length > 0 ? (
            recruiters.map((recruiter) =>
              !recruiter.verified ? (
                <div
                  key={recruiter.id}
                  className="flex justify-between items-center mb-4 p-4 border border-gray-300 rounded-lg shadow-sm"
                >
                  <div>
                    <p className="text-lg font-medium text-gray-800">{recruiter.name}</p>
                    <p className="text-sm text-gray-600">{recruiter.email}</p>
                  </div>
                  <button
                    onClick={() => approveRecruiter(recruiter.id)}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              ) : null
            )
          ) : (
            <p className="text-gray-600">No pending recruiter approvals.</p>
          )}
        </div>

        {/* Pending Student Approvals */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Pending Student Approvals</h2>
          {filteredStudents.filter((s) => !s.verified).length > 0 ? (
            filteredStudents.map((student) =>
              !student.verified ? (
                <div
                  key={student.id}
                  className="flex justify-between items-center mb-4 p-4 border border-gray-300 rounded-lg shadow-sm"
                >
                  <div>
                    <p className="text-lg font-medium text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveStudent(student.id)}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectStudent(student.id)}
                      className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => removeStudent(student.id)}
                      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : null
            )
          ) : (
            <p className="text-gray-600">No pending student approvals.</p>
          )}
        </div>

        {/* Enrolled Students */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Enrolled Students</h2>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex justify-between items-center mb-4 p-4 border border-gray-300 rounded-lg shadow-sm"
              >
                <div>
                  <p className="text-lg font-medium text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                  <p
                    className={`text-sm ${
                      student.verified ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {student.verified ? "Verified" : "Not Verified"}
                  </p>
                </div>
                <button
                  onClick={() => removeStudent(student.id)}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No enrolled students available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
