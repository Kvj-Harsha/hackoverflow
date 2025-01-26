"use client";

import { useState, useEffect, FormEvent } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

interface Student {
  email: string;
  name: string;
}

interface Job {
  id: string;
  jobTitle: string;
  description: string;
  eligibility: string;
  location: string;
  salary: string;
  instituteID: string;
}

interface Application {
  id: string;
  studentEmail: string;
  status: string;
  applicationFields: Record<string, string>;
}

export default function RecruiterPage() {
  const [instituteID, setInstituteID] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [eligibility, setEligibility] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [salary, setSalary] = useState<string>("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [rounds, setRounds] = useState<string[]>([]);
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
      await addDoc(jobsRef, {
        jobTitle,
        description,
        eligibility,
        location,
        salary,
        instituteID,
      });
      setJobTitle("");
      setDescription("");
      setEligibility("");
      setLocation("");
      setSalary("");
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
        eligibility: doc.data().eligibility,
        location: doc.data().location,
        salary: doc.data().salary,
        instituteID: doc.data().instituteID,
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
        status: doc.data().status,
        applicationFields: doc.data().applicationFields || {},
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

  const handleRoundCompletion = (index: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[index] += " (Completed)";
    setRounds(updatedRounds);
  };

  const announceResults = () => {
    alert("Results announced!");
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

      {/* Job Posting */}
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
          <input
            type="text"
            placeholder="Eligibility Criteria"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            className="block w-full p-3 mb-4 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full p-3 mb-4 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
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

      {/* Manage Applications */}
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
                      onClick={() => updateApplicationStatus(app.id, "Shortlisted")}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg mr-2"
                    >
                      Shortlist
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

      {/* Recruitment Rounds */}
      <section className="mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recruitment Process</h2>
        {rounds.map((round, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white p-4 mb-2 rounded-lg shadow-md"
          >
            <span>{round}</span>
            <button
              onClick={() => handleRoundCompletion(index)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Mark as Completed
            </button>
          </div>
        ))}
        <button
          onClick={announceResults}
          className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg"
        >
          Announce Results
        </button>
      </section>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
