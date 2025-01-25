"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  verified?: boolean;
}

interface Student {
  id: string;
  name: string;
  email: string;
  verified?: boolean;
}

export default function AdminDashboard() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchRecruiters();
    fetchStudents();
  }, []);

  const fetchRecruiters = async () => {
    const recruitersCollection = collection(db, "recruiters");
    const snapshot = await getDocs(recruitersCollection);
    setRecruiters(
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Recruiter))
    );
  };

  const fetchStudents = async () => {
    const studentsCollection = collection(db, "students");
    const snapshot = await getDocs(studentsCollection);
    setStudents(
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Student))
    );
  };

  const approveStudent = async (studentId: string) => {
    const studentDoc = doc(db, "students", studentId);
    await updateDoc(studentDoc, { verified: true });
    fetchStudents(); // Refresh data
  };

  const approveRecruiter = async (recruiterId: string) => {
    const recruiterDoc = doc(db, "recruiters", recruiterId);
    await updateDoc(recruiterDoc, { verified: true });
    fetchRecruiters(); // Refresh data
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Admin Dashboard</h1>
      </header>
      <main className="space-y-8">
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-700">Total Recruiters</h3>
              <p className="text-2xl font-bold text-gray-900">{recruiters.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Manage Recruiters</h2>
          <ul className="bg-white p-6 rounded-lg shadow-lg">
            {recruiters.map((recruiter) => (
              <li
                key={recruiter.id}
                className="flex justify-between items-center py-3 border-b last:border-b-0"
              >
                <span className="text-gray-800 font-medium">
                  {recruiter.name} ({recruiter.email})
                </span>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => approveRecruiter(recruiter.id)}
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Manage Students</h2>
          <ul className="bg-white p-6 rounded-lg shadow-lg">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex justify-between items-center py-3 border-b last:border-b-0"
              >
                <span className="text-gray-800 font-medium">
                  {student.name} ({student.email})
                </span>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => approveStudent(student.id)}
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
