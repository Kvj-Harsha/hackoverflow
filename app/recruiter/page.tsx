"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

interface Job {
  id: string;
  jobTitle: string;
  description: string;
  instituteID: string;
}

interface Student {
  email: string;
  name: string;
}

interface Application {
  id: string;
  studentEmail: string;
  jobID: string;
  status: string;
}

export default function RecruiterPage() {
  const [instituteID, setInstituteID] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");

  // Fetch students by instituteID
  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("instituteID", "==", instituteID));
      const querySnapshot = await getDocs(q);
      const studentsList: Student[] = querySnapshot.docs.map((doc) => ({
        email: doc.data().email,
        name: doc.data().studentName,
      }));
      setStudents(studentsList);
    } catch (err) {
      setError("Failed to fetch students. Please try again.");
    }
  };

  // Post a job offer
  const postJob = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const jobsRef = collection(db, "jobs");
      await addDoc(jobsRef, { jobTitle, description, instituteID });
      setJobTitle("");
      setDescription("");
      fetchJobs(); // Refresh job list
    } catch (err) {
      setError("Failed to post job. Please try again.");
    }
  };

  // Fetch jobs posted by recruiter
  const fetchJobs = async () => {
    try {
      const jobsRef = collection(db, "jobs");
      const q = query(jobsRef, where("instituteID", "==", instituteID));
      const querySnapshot = await getDocs(q);
      const jobsList: Job[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];
      setJobs(jobsList);
    } catch (err) {
      setError("Failed to fetch jobs. Please try again.");
    }
  };

  // Fetch applications for jobs
  const fetchApplications = async () => {
    try {
      const applicationsRef = collection(db, "applications");
      const q = query(applicationsRef, where("instituteID", "==", instituteID));
      const querySnapshot = await getDocs(q);
      const applicationsList: Application[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Application[];
      setApplications(applicationsList);
    } catch (err) {
      setError("Failed to fetch applications. Please try again.");
    }
  };

  // Accept or reject an application
  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const applicationRef = doc(db, "applications", id);
      await updateDoc(applicationRef, { status });
      fetchApplications(); // Refresh applications list
    } catch (err) {
      setError("Failed to update application. Please try again.");
    }
  };

  // Fetch data whenever instituteID changes
  useEffect(() => {
    if (instituteID) {
      fetchStudents();
      fetchJobs();
      fetchApplications();
    }
  }, [instituteID]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Recruiter Dashboard</h1>

      {/* Input for Institute ID */}
      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-800 mb-2">Institute ID</label>
        <input
          type="text"
          value={instituteID}
          onChange={(e) => setInstituteID(e.target.value)}
          className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Display Students */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Students Enrolled</h2>
        {students.length > 0 ? (
          <ul className="space-y-4">
            {students.map((student) => (
              <li key={student.email} className="p-4 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-all">
                <span className="text-lg font-medium">{student.name}</span> <br />
                <span className="text-sm text-gray-600">{student.email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No students found for this Institute ID.</p>
        )}
      </div>

      {/* Post Job */}
      <form onSubmit={postJob} className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Post a Job</h2>
        <input
          type="text"
          placeholder="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="w-full p-4 mb-4 bg-white border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Job Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 mb-4 bg-white border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all">
          Post Job
        </button>
      </form>

      {/* Display Applications */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Job Applications</h2>
        {applications.length > 0 ? (
          <ul className="space-y-4">
            {applications.map((app) => (
              <li key={app.id} className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center hover:bg-blue-50 transition-all">
                <span className="text-lg">{app.studentEmail} applied for Job ID: {app.jobID}</span>
                <div>
                  <button
                    onClick={() => updateApplicationStatus(app.id, "Accepted")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg mr-2 hover:bg-green-700 transition-all"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(app.id, "Rejected")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No applications found.</p>
        )}
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
