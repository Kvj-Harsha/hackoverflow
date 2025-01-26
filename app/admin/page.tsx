"use client";

import React, { useEffect, useState } from "react";
import { db } from "./../../lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  instituteId: string;
  placed?: boolean;
}

interface Recruiter {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

interface CollegeSettings {
  logoUrl: string;
  brandingColor: string;
  placementPolicy: string;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [user, setUser] = useState<any>(null);
  const [collegeSettings, setCollegeSettings] = useState<CollegeSettings>({
    logoUrl: "",
    brandingColor: "#ffffff",
    placementPolicy: "",
  });
  const [newPolicy, setNewPolicy] = useState("");
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/signin");
      }
    });

    const fetchData = async () => {
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const recruitersSnapshot = await getDocs(collection(db, "recruiters"));

      setStudents(
        studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[]
      );
      setRecruiters(
        recruitersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Recruiter[]
      );
    };
    const fetchCollegeSettings = async () => {
      const settingsDoc = doc(db, "collegeSettings", "settings");
      const settingsSnap = await getDocs(collection(db, "collegeSettings"));
      if (!settingsSnap.empty) {
        setCollegeSettings(settingsSnap.docs[0].data() as CollegeSettings);
      }
    };

    fetchData();
    fetchCollegeSettings();
  }, [router]);

  const updateCollegeSettings = async () => {
    const settingsDoc = doc(db, "collegeSettings", "settings");
    await updateDoc(settingsDoc, {
      logoUrl: collegeSettings.logoUrl,
      brandingColor: collegeSettings.brandingColor,
      placementPolicy: collegeSettings.placementPolicy
    });
  };
  const approveStudent = async (studentId: string) => {
    const studentDoc = doc(db, "students", studentId);
    await updateDoc(studentDoc, { verified: true });
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, verified: true } : student
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
    router.push("/signin");
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: collegeSettings.brandingColor }}
    >
      <button
        onClick={signOutUser}
        className="absolute top-8 right-8 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        Sign Out
      </button>

      <h1 className="text-4xl font-bold mb-8 text-blue-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* College Setup */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">College Setup</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College Logo URL
            </label>
            <input
              type="text"
              value={collegeSettings.logoUrl}
              onChange={(e) =>
                setCollegeSettings({ ...collegeSettings, logoUrl: e.target.value })
              }
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branding Color
            </label>
            <input
              type="color"
              value={collegeSettings.brandingColor}
              onChange={(e) =>
                setCollegeSettings({
                  ...collegeSettings,
                  brandingColor: e.target.value,
                })
              }
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placement Policy
            </label>
            <textarea
              value={collegeSettings.placementPolicy}
              onChange={(e) =>
                setCollegeSettings({
                  ...collegeSettings,
                  placementPolicy: e.target.value,
                })
              }
              className="border border-gray-300 rounded-md p-2 w-full"
              rows={4}
            />
          </div>
          <button
            onClick={updateCollegeSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save Settings
          </button>
        </div>

        {/* Pending Recruiters */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Pending Recruiter Approvals</h2>
          {recruiters.filter((r) => !r.verified).length > 0 ? (
            recruiters.filter((r) => !r.verified).map((recruiter) => (
              <div
                key={recruiter.id}
                className="flex justify-between items-center mb-4 p-4 border border-gray-300 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{recruiter.name}</p>
                  <p className="text-gray-600">{recruiter.email}</p>
                </div>
                <button
                  onClick={() => approveRecruiter(recruiter.id)}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                >
                  Approve
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No pending recruiter approvals.</p>
          )}
        </div>

        {/* Student Management */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Student Management</h2>
          {students.length > 0 ? (
            students.map((student) => (
              <div
                key={student.id}
                className="flex justify-between items-center mb-4 p-4 border border-gray-300 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{student.name}</p>
                  <p className="text-gray-600">{student.email}</p>
                  <p
                    className={`text-sm ${
                      student.verified ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {student.verified ? "Verified" : "Not Verified"}
                  </p>
                  <p className="text-sm text-blue-600">
                    {student.placed ? "Placed" : "Not Placed"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveStudent(student.id)}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => removeStudent(student.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
                  >
                    Remove
                  </button>
                </div>
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
