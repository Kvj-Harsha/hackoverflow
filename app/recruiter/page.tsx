"use client";

import { useState, useEffect, FormEvent } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

// Define types for the data structures
interface Student {
  email: string;
  name: string;
}

interface Job {
  id: string;
  jobTitle: string;
  description: string;
  instituteID: string;
}

interface Application {
  id: string;
  studentEmail: string;
  status: string;
}

export default function RecruiterPage() {
  const [instituteID, setInstituteID] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string>("");

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("instituteID", "==", instituteID));
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map((doc) => ({
        email: doc.data().email,
        name: doc.data().studentName,
      }));
      setStudents(studentsList);
    } catch (err) {
      setError("Failed to fetch students. Please try again.");
    }
  };

  const postJob = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const jobsRef = collection(db, "jobs");
      await addDoc(jobsRef, { jobTitle, description, instituteID });
      setJobTitle("");
      setDescription("");
      fetchJobs();
    } catch (err) {
      setError("Failed to post job. Please try again.");
    }
  };

  const fetchJobs = async () => {
    try {
      const jobsRef = collection(db, "jobs");
      const q = query(jobsRef, where("instituteID", "==", instituteID));
      const querySnapshot = await getDocs(q);
      const jobsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        jobTitle: doc.data().jobTitle,
        description: doc.data().description,
        instituteID: doc.data().instituteID
      }));
      setJobs(jobsList);
    } catch (err) {
      setError("Failed to fetch jobs. Please try again.");
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsRef = collection(db, "applications");
      const q = query(applicationsRef, where("instituteID", "==", instituteID));
      const querySnapshot = await getDocs(q);
      const applicationsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        studentEmail: doc.data().studentEmail,
        status: doc.data().status
      }));
      setApplications(applicationsList);
    } catch (err) {
      setError("Failed to fetch applications. Please try again.");
    }
  };
  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const applicationRef = doc(db, "applications", id);
      await updateDoc(applicationRef, { status });
      fetchApplications();
    } catch (err) {
      setError("Failed to update application. Please try again.");
    }
  };

  useEffect(() => {
    if (instituteID) {
      fetchStudents();
      fetchJobs();
      fetchApplications();
    }
  }, [instituteID]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header Section */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Recruiter Dashboard</h1>
        <div className="mt-4">
          <label className="text-lg font-medium text-gray-700">Institute ID:</label>
          <input
            type="text"
            value={instituteID}
            onChange={(e) => setInstituteID(e.target.value)}
            className="ml-4 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800">Total Students</h2>
          <p className="text-3xl font-bold text-blue-600">{students.length}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800">Jobs Posted</h2>
          <p className="text-3xl font-bold text-blue-600">{jobs.length}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800">Applications</h2>
          <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
        </div>
      </div>

      {/* Students List */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Students</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {students.length > 0 ? (
            <ul className="space-y-3">
              {students.map((student) => (
                <li key={student.email} className="flex justify-between items-center">
                  <span>{student.name}</span>
                  <span className="text-gray-500">{student.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No students found.</p>
          )}
        </div>
      </section>

      {/* Post Job Section */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Post a Job</h2>
        <form onSubmit={postJob} className="bg-white rounded-lg shadow-md p-6">
          <input
            type="text"
            placeholder="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="block w-full p-3 mb-4 border rounded-lg"
          />
          <textarea
            placeholder="Job Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full p-3 mb-4 border rounded-lg"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Post Job
          </button>
        </form>
      </section>

      {/* Applications List */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Applications</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {applications.length > 0 ? (
            <ul className="space-y-3">
              {applications.map((app) => (
                <li key={app.id} className="flex justify-between items-center">
                  <span>{app.studentEmail}</span>
                  <div>
                    <button
                      onClick={() => updateApplicationStatus(app.id, "Accepted")}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg mr-2"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(app.id, "Rejected")}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No applications found.</p>
          )}
        </div>
      </section>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
